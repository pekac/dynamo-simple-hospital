import { Injectable } from '@nestjs/common';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import { PATIENT_ID_PREFIX, Patient } from '..';

import { Resource } from 'src/dynamo';

import { truncateDateToWeek } from 'src/utils';

@Injectable()
export class PatientsResource extends Resource<Patient> {
  constructor() {
    super({ entityTemplate: Patient, pkPrefix: PATIENT_ID_PREFIX });
  }

  async listByLastName(
    collection: string = 'A',
    limit: number = 20,
    lastSeen: string = 'A',
  ): Promise<Patient[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
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

    const { Items } = await this.client.send(command);
    return Items?.map((item) => this.mapToEntity(item)) as Patient[];
  }

  async listByCreatedAt(
    collection: string = truncateDateToWeek(new Date()).toISOString(),
    limit: number = 20,
    lastSeen: string = new Date().toISOString(),
  ): Promise<Patient[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :pk AND #sk < :sk',
      ExpressionAttributeNames: {
        '#pk': 'GSI2PK',
        '#sk': 'GSI2SK',
      },
      ExpressionAttributeValues: {
        ':pk': `${PATIENT_ID_PREFIX}${collection}`,
        ':sk': `${PATIENT_ID_PREFIX}${lastSeen}`,
      },
      ScanIndexForward: false,
      Limit: limit,
    });

    const { Items } = await this.client.send(command);
    return Items?.map((item) => this.mapToEntity(item)) as Patient[];
  }
}
