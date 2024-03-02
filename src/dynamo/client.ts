import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: process.env.DYNAMO_REGION as string,
  endpoint: process.env.DYNAMO_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.DYNAMO_KEY_ID as string,
    secretAccessKey: process.env.DYNAMO_SECRET as string,
  },
});

export const client = DynamoDBDocumentClient.from(dynamoClient);
export const DATA_TABLE = 'data';
