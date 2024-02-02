import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

import { DATA_TABLE } from '../client';

import { crossPartitionEntityList } from '../helpers';

import { PATIENT_ID_PREFIX } from '../../services';

async function listByLastname(
  client: DynamoDBDocumentClient,
  collection: string = 'A',
  limit: number = 25,
  lastSeen: string = 'A',
): Promise<any[]> {
  const command = new QueryCommand({
    TableName: DATA_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: '#pk = :pk AND #sk > :sk',
    ExpressionAttributeNames: {
      '#pk': 'GSI1PK',
      '#sk': 'GSI1SK',
    },
    ExpressionAttributeValues: {
      ':pk': `${PATIENT_ID_PREFIX}${collection}`,
      ':sk': `${PATIENT_ID_PREFIX}${lastSeen}`,
    },
    Limit: limit,
  });

  const { Items } = await client.send(command);
  return Items || [];
}

async function listPatients(
  client: DynamoDBDocumentClient,
  lastSeen: string,
  limit: number,
) {
  const firstCollection: string = 'A';
  const lastCollection: string = 'Z';

  const shouldContinue = (col: string) =>
    col.charCodeAt(0) <= lastCollection.charCodeAt(0);

  const getItems = (col: string, limit: number, lastSeen = '$') =>
    listByLastname(client, col, limit, lastSeen.toUpperCase());

  const updateCollection = (
    col: string,
  ): { collection: string; lastSeen?: string } => {
    return {
      collection: String.fromCharCode(col.charCodeAt(0) + 1),
    };
  };

  return crossPartitionEntityList({
    collection: lastSeen === '$' ? firstCollection : lastSeen.charAt(0),
    lastSeen,
    limit,
    getItems,
    shouldContinue,
    updateCollection,
  });
}

export async function updatePatientsWithGSI3(client: DynamoDBDocumentClient) {
  /* TODO:
    - if ok - if fail?
    - undo all from success list? or remember last one written and start from there?
   */
  let lastSeen: string = '$';
  const limit: number = 25;

  while (true) {
    try {
      const patients = await listPatients(client, lastSeen, limit);
      const updateRequests = [];
      for (const patient of patients) {
        const request = {
          PutRequest: {
            Item: {
              ...patient,
              GSI3PK: patient.PK,
              GSI3SK: patient.SK,
            },
          },
        };
        updateRequests.push(request);
      }

      const command = new BatchWriteCommand({
        RequestItems: {
          [DATA_TABLE]: updateRequests,
        },
      });
      await client.send(command);

      if (patients.length < limit) {
        break;
      }

      lastSeen = patients[patients.length - 1].Id;
    } catch (e) {
      console.log('patient happens', e.message);
      return;
    }
  }
}
