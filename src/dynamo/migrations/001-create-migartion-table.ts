import {
  CreateTableCommandInput,
  DeleteTableCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { createTable } from '../helpers';

import { MIGRATIONS_TABLE } from '../migration-controller';

export async function createMigrationsTable(client: DynamoDBDocumentClient) {
  const options: CreateTableCommandInput = {
    TableName: MIGRATIONS_TABLE,
    AttributeDefinitions: [
      { AttributeName: 'MigrationId', AttributeType: 'S' },
    ],
    KeySchema: [{ AttributeName: 'MigrationId', KeyType: 'HASH' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  };
  await createTable(client, MIGRATIONS_TABLE, options);
}

async function down(client: DynamoDBDocumentClient) {
  const command = new DeleteTableCommand({
    TableName: MIGRATIONS_TABLE,
  });

  await client.send(command);
}
