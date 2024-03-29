import {
  CreateTableCommand,
  CreateTableCommandInput,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

type UpdateExpressionAndValues = {
  UpdateExpression: string;
  ExpressionAttributeValues: { [key: string]: string };
};

export function projectionGenerator<T>(template: { new (): T & {} }): {
  projectionExpression: string;
  projectionNames: Record<string, string>;
} {
  const shape = new template();
  const keys = Object.keys(shape).map((key) => `#${key}`);

  const projectionNames = Object.keys(shape).reduce(
    (acc: Record<string, string>, key: string, i: number) => {
      const transformedKey = keys[i];
      acc[transformedKey] = key;
      return acc;
    },
    {},
  );

  return {
    projectionExpression: keys.join(', '),
    projectionNames,
  };
}

export function objToUpdateExpression(obj: {
  [key: string]: any;
}): UpdateExpressionAndValues {
  let updateExpression = [];
  const expressionAttributeValues: { [key: string]: string } = {};
  for (const key in obj) {
    const bind = `:${key.toLowerCase()}`;
    const expression = `${key} = ${bind}`;
    expressionAttributeValues[bind] = obj[key];
    updateExpression.push(expression);
  }

  return {
    UpdateExpression: `set ${updateExpression.join(',')}`,
    ExpressionAttributeValues: expressionAttributeValues,
  };
}

export async function createTable(
  client: DynamoDBDocumentClient,
  tableName: string,
  options: CreateTableCommandInput,
): Promise<string> {
  try {
    const listCommand = new ListTablesCommand({});
    const { TableNames = [] } = await client.send(listCommand);

    if (TableNames.includes(tableName)) return tableName;

    const createCommand = new CreateTableCommand(options);
    await client.send(createCommand);

    return tableName;
  } catch (e) {
    throw new Error(e.message);
  }
}

interface ICrossPartitionEntityList<T> {
  collection: string;
  lastSeen?: string;
  limit: number;
  getItems: (c: string, limit: number, lastSeen?: string) => Promise<T[]>;
  shouldContinue: (c: string) => boolean;
  updateCollection: (
    c: string,
    lastSeenItem: T | string | undefined,
  ) => { collection: string; lastSeen: string };
}

type Identity = { id: string };

export async function crossPartitionEntityList<T extends Identity>({
  collection,
  lastSeen = '$',
  limit: totalLimit,
  getItems,
  shouldContinue,
  updateCollection,
}: ICrossPartitionEntityList<T>): Promise<T[]> {
  const entityList: T[] = [];
  while (entityList.length < totalLimit && shouldContinue(collection)) {
    const items = await getItems(
      collection,
      totalLimit - entityList.length,
      lastSeen,
    );
    for (const item of items) {
      entityList.push(item);
    }

    const lastSeenItem = entityList[entityList.length - 1];

    if (items.length < totalLimit) {
      ({ collection, lastSeen } = updateCollection(collection, lastSeenItem));
    }
  }

  return entityList;
}
