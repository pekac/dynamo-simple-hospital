import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'peky',
    secretAccessKey: 'peky',
  },
});

export const client = DynamoDBDocumentClient.from(dynamoClient);
export const DATA_TABLE = 'data';
