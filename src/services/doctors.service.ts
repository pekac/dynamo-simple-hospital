import { Injectable } from '@nestjs/common';
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { CreateDoctorDto, LastSeenDoctorDto } from '../dtos';

import { DATA_TABLE, client } from '../dynamo';

import { Doctor } from '../entities';

import { Resource } from '../utils';

const ID_PREFIX = 'DOCTOR#';

/* TODO:
- [] test doctor service
- [] extract specialization service
- [] model listing doctors
- [] model many-to-many /w patients 
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
      TableName: DATA_TABLE,
      Item: item,
    });
    try {
      await client.send(command);
      return this.mapToEntity(item);
    } catch (e) {
      return undefined;
    }
  }

  /* TODO: extract to specialization service */
  async addNewSpecialization(specialization: string) {
    const command = new UpdateCommand({
      TableName: DATA_TABLE,
      Key: {
        PK: 'DOCTOR',
        SK: `SPECIALIZATION`,
      },
      UpdateExpression: 'Add #specialization :specialization',
      ExpressionAttributeNames: {
        '#specialization': 'Specializations',
      },
      ExpressionAttributeValues: {
        ':specialization': specialization.toUpperCase(),
      },
      ReturnValues: 'ALL_NEW',
    });
    const result = await client.send(command);
    return result;
  }

  async getSpecializations() {
    const command = new GetCommand({
      TableName: DATA_TABLE,
      Key: {
        PK: 'DOCTOR',
        SK: `SPECIALIZATION`,
      },
    });
    const { Item } = await client.send(command);
    return Item?.Specialization;
  }

  /* TODO: generalize lastSeen type */
  async list(
    specialization: string,
    limit: number = 5,
    lastSeen: LastSeenDoctorDto,
  ) {
    const command = new QueryCommand({
      TableName: DATA_TABLE,
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

    const { Items } = await client.send(command);
    return Items;
  }
}
