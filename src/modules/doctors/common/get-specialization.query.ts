import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { SPECIALIZATION_KEY } from 'src/core';

import { DATA_TABLE, client } from 'src/dynamo';

export async function getSpecializationsQuery(): Promise<string[]> {
  const command = new GetCommand({
    TableName: DATA_TABLE,
    Key: SPECIALIZATION_KEY,
  });
  const { Item } = await client.send(command);
  return Array.from(Item?.Specializations || new Set([]));
}
