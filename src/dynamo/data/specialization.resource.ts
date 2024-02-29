import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { ISpecializationResource } from 'src/core';

import { DATA_TABLE, client } from '../client';

import { SPECIALIZATION_KEY } from '../constants';

export class SpecializationResource implements ISpecializationResource {
  async create(specialization: string): Promise<string | undefined> {
    const command = new UpdateCommand({
      TableName: DATA_TABLE,
      Key: SPECIALIZATION_KEY,
      UpdateExpression: 'ADD #specialization :specialization',
      ExpressionAttributeNames: {
        '#specialization': 'Specializations',
      },
      ExpressionAttributeValues: {
        ':specialization': new Set([specialization.toUpperCase()]),
      },
      ReturnValues: 'ALL_NEW',
    });

    await client.send(command);
    return specialization;
  }
}
