import { UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { DATA_TABLE } from '../client';

export async function addGSI3(client: DynamoDBDocumentClient) {
  const command = new UpdateTableCommand({
    TableName: DATA_TABLE,
    AttributeDefinitions: [
      { AttributeName: 'GSI3PK', AttributeType: 'S' },
      { AttributeName: 'GSI3SK', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexUpdates: [
      {
        Create: {
          IndexName: 'GSI3',
          KeySchema: [
            { AttributeName: 'GSI3PK', KeyType: 'HASH' },
            { AttributeName: 'GSI3SK', KeyType: 'RANGE' },
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
