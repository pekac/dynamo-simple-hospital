import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

import { DATA_TABLE } from '../client';

import { crossPartitionEntityList } from '../helpers';

async function listBySpecialization(
  client: DynamoDBDocumentClient,
  specialization: string = 'A',
  limit: number = 25,
  lastSeen: string = 'A',
): Promise<any[]> {
  const command = new QueryCommand({
    TableName: DATA_TABLE,
    IndexName: 'GSI2',
    KeyConditionExpression: '#pk = :pk AND #sk > :sk',
    ExpressionAttributeNames: {
      '#pk': 'GSI2PK',
      '#sk': 'GSI2SK',
    },
    ExpressionAttributeValues: {
      ':pk': `SPECIALIZATION#${specialization}`,
      ':sk': `${specialization}#${lastSeen}`,
    },
    Limit: limit,
  });

  const { Items } = await client.send(command);
  return Items || [];
}

async function getSpecializations(
  client: DynamoDBDocumentClient,
): Promise<string[]> {
  const command = new GetCommand({
    TableName: DATA_TABLE,
    Key: {
      PK: 'DOCTOR',
      SK: 'SPECIALIZATION',
    },
  });
  const { Item } = await client.send(command);
  return Array.from(Item?.Specializations || new Set([]));
}

async function listDoctors(
  client: DynamoDBDocumentClient,
  collections: string[],
  lastCollection: string,
  lastSeen: string,
  limit: number,
) {
  const shouldContinue = (col: string) => collections.includes(col);

  const getItems = (col: string, limit: number, lastSeen: string) =>
    listBySpecialization(client, col, limit, lastSeen);

  const updateCollection = (col: string, lastSeen: string = '$') => {
    const index = collections.indexOf(col);
    return {
      collection:
        index < collections.length - 1 ? collections[index + 1] : 'THE_END',
      lastSeen,
    };
  };

  return crossPartitionEntityList({
    collection: lastCollection?.toUpperCase() || collections[0],
    lastSeen: lastSeen,
    limit,
    getItems,
    shouldContinue,
    updateCollection,
  });
}

export async function updateDoctorsWithGSI3(client: DynamoDBDocumentClient) {
  /* TODO:
    - if ok - if fail?
    - undo all from success list? or remember last one written and start from there?
   */
  const collections: string[] = (await getSpecializations(client)).sort() || [];
  const limit: number = 25;

  let collection = collections[0];
  let lastSeen: string = '$';

  while (true) {
    try {
      const doctors = await listDoctors(
        client,
        collections,
        collection,
        lastSeen,
        limit,
      );

      const updateRequests = [];
      for (const doctor of doctors) {
        const request = {
          PutRequest: {
            Item: {
              ...doctor,
              GSI3PK: doctor.PK,
              GSI3SK: doctor.SK,
            },
          },
        };
        updateRequests.push(request);
      }

      if (updateRequests.length === 0) {
        return;
      }

      const command = new BatchWriteCommand({
        RequestItems: {
          [DATA_TABLE]: updateRequests,
        },
      });
      await client.send(command);

      if (doctors.length < limit) {
        break;
      }

      const lastDoctor = doctors[doctors.length - 1];
      lastSeen = lastDoctor.Id;
      collection = lastDoctor.Specialization;
    } catch (e) {
      console.log('doctor happens', e.message);
      return;
    }
  }
}
