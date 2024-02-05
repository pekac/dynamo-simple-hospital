import { Injectable } from '@nestjs/common';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { DATA_TABLE, client } from 'src/dynamo';

const Key = {
  PK: 'DOCTOR',
  SK: 'SPECIALIZATION',
};

/* TODO;
- Implement resource for singletons (maybe some day?)
 */
@Injectable()
export class SpecializationService {
  async create(specialization: string) {
    const command = new UpdateCommand({
      TableName: DATA_TABLE,
      Key,
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

  async getSpecializations(): Promise<string[]> {
    const command = new GetCommand({
      TableName: DATA_TABLE,
      Key,
    });
    const { Item } = await client.send(command);
    return Array.from(Item?.Specializations || new Set([]));
  }
}
