import { Injectable } from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
const KSUID = require('ksuid');

import { CreateTestDto, GetTestDto } from '../dtos/';

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
    /* for fetching by doctor id */
    const GSI1PK = `DOCTOR#${createTestDto.doctorId}`;
    const GSI1SK = primaryKey.SK;

    const command = new PutCommand({
      TableName: DATA_TABLE,
      Item: {
        ...primaryKey,
        Id: ksuid,
        Code: createTestDto.code,
        Type: createTestDto.type,
        CreatedAt: createdAt.toISOString(),
        GSI1PK,
        GSI1SK,
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

  async listTestsForPatient(
    patientId: string,
    lastSeen: string = '$',
    limit: number = 20,
  ): Promise<GetTestDto[]> {
    const PK = `PATIENT#${patientId}`;
    const SK = lastSeen === '$' ? PK : `#TEST#${lastSeen}`;
    const command = new QueryCommand({
      TableName: DATA_TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk < :sk',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': PK,
        ':sk': SK,
      },
      ScanIndexForward: false,
      Limit: limit,
    });

    const { Items } = await client.send(command);
    return Items as GetTestDto[];
  }
}
