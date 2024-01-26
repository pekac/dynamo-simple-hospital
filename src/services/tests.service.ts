import { Injectable } from '@nestjs/common';
import { DeleteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
const KSUID = require('ksuid');

import { CreateTestDto } from '../dtos/';

import { DATA_TABLE, client } from '../dynamo/';

type Key = 'PK' | 'SK';
type ItemKey = {
  [key in Key]: string;
};

function generateTestItemKey(patientId: string, ksuid: string): ItemKey {
  return {
    PK: `PATIENT#${patientId}`,
    SK: `#TEST#${ksuid}`,
  };
}

@Injectable()
export class TestsService {
  async create(patientId: string, createTestDto: CreateTestDto) {
    const createdAt = new Date();
    const ksuid = KSUID.randomSync(createdAt).string;
    const primaryKey = generateTestItemKey(patientId, ksuid);

    const command = new PutCommand({
      TableName: DATA_TABLE,
      Item: {
        ...primaryKey,
        Code: createTestDto.code,
        Type: createTestDto.type,
        CreatedAt: createdAt.toISOString(),
      },
    });
    const result = await client.send(command);
    return result;
  }

  async one(patientId: string, testId: string) {
    const key = generateTestItemKey(patientId, testId);
    const command = new GetCommand({
      TableName: DATA_TABLE,
      Key: key,
    });
    const { Item } = await client.send(command);
    return Item;
  }

  async remove(patientId: string, testId: string) {
    const key = generateTestItemKey(patientId, testId);
    const command = new DeleteCommand({
      TableName: DATA_TABLE,
      Key: key,
    });
    const result = await client.send(command);
    return result;
  }
}
