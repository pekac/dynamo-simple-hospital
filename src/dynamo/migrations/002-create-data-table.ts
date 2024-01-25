import {
  CreateTableCommandInput,
  DeleteTableCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { DATA_TABLE } from '../client';

import { createTable } from '../helpers';

export async function createDataTable(client: DynamoDBDocumentClient) {
  const options: CreateTableCommandInput = {
    TableName: DATA_TABLE,
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };
  await createTable(client, DATA_TABLE, options);
}

async function down(client: DynamoDBDocumentClient) {
  const command = new DeleteTableCommand({
    TableName: DATA_TABLE,
  });

  await client.send(command);
}
