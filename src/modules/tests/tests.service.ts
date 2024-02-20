import { Injectable } from '@nestjs/common';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
const KSUID = require('ksuid');

import { DOCTOR_ID_PREFIX, PATIENT_ID_PREFIX, Test } from '../../core';

import { ITestsService } from './test.interface';

import { Resource } from '../../dynamo/';

@Injectable()
export class TestsService extends Resource<Test> implements ITestsService {
  constructor() {
    super(Test, TEST_PK_PREFIX, TEST_SK_PREFIX);
  }

  async create(
    createTestDto: Test,
    patientId: string,
  ): Promise<Test | undefined> {
    const createdAt = new Date();
    const ksuid = KSUID.randomSync(createdAt).string;
    const primaryKey = this.generateItemKey(patientId, ksuid);
    /* for fetching by doctor id */
    const GSI1PK = `${DOCTOR_ID_PREFIX}${createTestDto.doctorId}`;
    const GSI1SK = primaryKey.SK;

    const item = {
      ...primaryKey,
      Id: ksuid,
      Code: createTestDto.code,
      Type: createTestDto.type,
      CreatedAt: createdAt.toISOString(),
      GSI1PK,
      GSI1SK,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    await this.client.send(command);
    return this.mapToEntity(item);
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
}
