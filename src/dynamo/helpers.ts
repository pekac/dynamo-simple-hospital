import {
  CreateTableCommand,
  CreateTableCommandInput,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { capitalize } from '../utils/';

type UpdateExpressionAndValues = {
  UpdateExpression: string;
  ExpressionAttributeValues: { [key: string]: string };
};

export function objToUpdateExpression(obj: {
  [key: string]: any;
}): UpdateExpressionAndValues {
  let updateExpression = [];
  const expressionAttributeValues: { [key: string]: string } = {};
  for (const key in obj) {
    const bind = `:${key.toLowerCase()}`;
    const expression = `set ${capitalize(key)} = ${bind}`;
    expressionAttributeValues[bind] = obj[key];
    updateExpression.push(expression);
  }

  return {
    UpdateExpression: updateExpression.join(','),
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
  updateCollection: (c: string) => { collection: string; lastSeen?: string };
}

type Identity = { id: string };

export async function crossPartitionEntityList<T extends Identity>({
  collection,
  lastSeen,
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

    lastSeen = entityList[entityList.length - 1]?.id || lastSeen;

    if (items.length < totalLimit) {
      ({ collection, lastSeen } = updateCollection(collection));
    }
  }

  return entityList;
}
