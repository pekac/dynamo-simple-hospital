import { Injectable } from '@nestjs/common';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import {
  DOCTOR_ID_PREFIX,
  TEST_PK_PREFIX,
  TEST_SK_PREFIX,
  Test,
} from 'src/core';

import { Resource } from '../resource';

@Injectable()
export class TestsResource extends Resource<Test> {
  constructor() {
    super({
      entityTemplate: Test,
      pkPrefix: TEST_PK_PREFIX,
      skPrefix: TEST_SK_PREFIX,
    });
  }

  async listTestsForDoctor(
    doctorId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<Test[]> {
    const PK = `${DOCTOR_ID_PREFIX}${doctorId}`;
    const SK = lastSeen === '$' ? PK : `${TEST_SK_PREFIX}${lastSeen}`;
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI1',
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

    const { Items } = await this.client.send(command);
    return Items as Test[];
  }

  async listTestsForPatient(
    patientId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<Test[]> {
    const PK = `${TEST_PK_PREFIX}${patientId}`;
    const SK = lastSeen === '$' ? PK : `${TEST_SK_PREFIX}${lastSeen}`;
    const command = new QueryCommand({
      TableName: this.tableName,
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

    const { Items } = await this.client.send(command);
    return Items as Test[];
  }
}
