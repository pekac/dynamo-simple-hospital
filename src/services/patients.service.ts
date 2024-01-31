import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';

import { CreatePatientDto } from '../dtos';

import { Patient } from '../entities/';

import { capitalize, Resource, truncateDateToWeek } from '../utils/';

const ID_PREFIX = 'PATIENT#';

@Injectable()
export class PatientsService extends Resource<Patient> {
  constructor() {
    super(Patient, ID_PREFIX);
  }

  async create(
    createPatientDto: CreatePatientDto,
  ): Promise<Patient | undefined> {
    const primaryKey = this.generateItemKey(createPatientDto.id);
    /* list by last name */
    const firstLetter = createPatientDto.lastName.charAt(0);
    const GSI1PK = `${ID_PREFIX}${capitalize(firstLetter)}`;
    const GSI1SK = `${ID_PREFIX}${createPatientDto.lastName.toUpperCase()}`;
    /* list by created at */
    const createdAt = new Date();
    const GSI2PK = `${ID_PREFIX}${truncateDateToWeek(createdAt).toISOString()}`;
    const GSI2SK = `${ID_PREFIX}${createdAt.toISOString()}`;

    const item = {
      ...primaryKey,
      Id: createPatientDto.id,
      FirstName: createPatientDto.firstName,
      LastName: createPatientDto.lastName,
      Age: createPatientDto.age,
      CreatedAt: createdAt.toISOString(),
      GSI1PK,
      GSI1SK,
      GSI2PK,
      GSI2SK,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    try {
      await this.client.send(command);
      return this.mapToEntity(item);
    } catch (e) {
      return undefined;
    }
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
        ':pk': `${ID_PREFIX}${collection}`,
        ':sk': `${ID_PREFIX}${lastSeen}`,
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
        ':pk': `${ID_PREFIX}${collection}`,
        ':sk': `${ID_PREFIX}${lastSeen}`,
      },
      ScanIndexForward: false,
      Limit: limit,
    });

    const { Items } = await this.client.send(command);
    return Items?.map((item) => this.mapToEntity(item)) as Patient[];
  }
}
