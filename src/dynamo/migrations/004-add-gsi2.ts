import { UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
/* client */
import { DATA_TABLE } from '../client';

export async function addGSI2(client: DynamoDBDocumentClient) {
  const command = new UpdateTableCommand({
    TableName: DATA_TABLE,
    AttributeDefinitions: [
      { AttributeName: 'GSI2PK', AttributeType: 'S' },
      { AttributeName: 'GSI2SK', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexUpdates: [
      {
        Create: {
          IndexName: 'GSI2',
          KeySchema: [
            { AttributeName: 'GSI2PK', KeyType: 'HASH' },
            { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
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
