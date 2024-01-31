import { Injectable } from '@nestjs/common';
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { CreateDoctorDto, LastSeenDoctorDto } from '../dtos';

import { Doctor } from '../entities';

import { Resource } from '../utils';

const ID_PREFIX = 'DOCTOR#';

/* TODO:
- [] model listing doctors
- [] model many-to-many /w patients 
- [] test doctor service
- [] update test service /w resource
- [] extract specialization service
- [] error handling and docs
*/
@Injectable()
export class DoctorsService extends Resource<Doctor> {
  constructor() {
    super(Doctor, ID_PREFIX);
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor | undefined> {
    const createdAt = new Date();
    const primaryKey = this.generateItemKey(createDoctorDto.id);
    /* for fetching tests */
    const GSI1PK = primaryKey.PK;
    const GSI1SK = primaryKey.SK;

    /* for listing by specialization */
    const specialization = createDoctorDto.specialization.toUpperCase();
    const GSI2PK = `SPECIALIZATION#${specialization}`;
    const GSI2SK = `${specialization}#${createDoctorDto.id}`;

    const item = {
      ...primaryKey,
      Id: createDoctorDto.id,
      FirstName: createDoctorDto.firstName,
      LastName: createDoctorDto.lastName,
      Specialization: createDoctorDto.specialization,
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

  /* TODO: extract to specialization service */
  async addNewSpecialization(specialization: string) {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: 'DOCTOR',
        SK: 'SPECIALIZATION',
      },
      UpdateExpression: 'ADD #specialization :specialization',
      ExpressionAttributeNames: {
        '#specialization': 'Specializations',
      },
      ExpressionAttributeValues: {
        ':specialization': new Set([specialization.toUpperCase()]),
      },
      ReturnValues: 'ALL_NEW',
    });
    const result = await this.client.send(command);
    return specialization;
  }

  async getSpecializations() {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: 'DOCTOR',
        SK: 'SPECIALIZATION',
      },
    });
    const { Item } = await this.client.send(command);
    return Array.from(Item?.Specializations || new Set([]));
  }

  /* TODO: generalize lastSeen type */
  async list(
    specialization: string,
    limit: number = 5,
    lastSeen: LastSeenDoctorDto,
  ) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :pk AND #sk > :sk',
      ExpressionAttributeNames: {
        '#pk': 'GSI2PK',
        '#sk': 'GSI2SK',
      },
      ExpressionAttributeValues: {
        ':pk': `SPECIALIZATION#${specialization}`,
        ':sk': `${specialization}#${lastSeen.id}`,
      },
      Limit: limit,
    });

    const { Items } = await this.client.send(command);
    return Items;
  }
}
