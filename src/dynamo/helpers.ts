import {
  CreateTableCommand,
  CreateTableCommandInput,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
/* utils */
import { capitalize } from '../utils/text';

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
  limit: number;
  getItems: (c: string) => Promise<T[]>;
  shouldContinue: (c: string) => boolean;
  updateCollection: (c: string) => string;
}

export async function crossPartitionEntityList<T>({
  collection,
  limit,
  getItems,
  shouldContinue,
  updateCollection,
}: ICrossPartitionEntityList<T>): Promise<T[]> {
  const entityList: T[] = [];
  while (entityList.length < limit && shouldContinue(collection)) {
    const items = await getItems(collection);

    for (const item of items) {
      entityList.push(item);
    }

    if (items.length < limit) {
      collection = updateCollection(collection);
    }
  }

  return entityList;
}
