import { UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { DATA_TABLE } from '../client';

export async function addGSI1(client: DynamoDBDocumentClient) {
  const command = new UpdateTableCommand({
    TableName: DATA_TABLE,
    AttributeDefinitions: [
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexUpdates: [
      {
        Create: {
          IndexName: 'GSI1',
          KeySchema: [
            { AttributeName: 'GSI1PK', KeyType: 'HASH' },
            { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
    ],
  });
  await client.send(command);
}
