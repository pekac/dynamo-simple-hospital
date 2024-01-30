import { Injectable } from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { CreateDoctorDto, LastSeenDoctorDto, UpdateDoctorDto } from '../dtos';

import { DATA_TABLE, client, objToUpdateExpression } from '../dynamo';

const ID_PREFIX = 'DOCTOR#';

type Key = 'PK' | 'SK';
type ItemKey = {
  [key in Key]: string;
};
/* 
TODO (services):
- [x] extract service template 
- [x] add id in attrs
- [] transform data to include only app relevant attrs
*/
function generateDoctorItemKey(doctorId: string): ItemKey {
  return {
    PK: `${ID_PREFIX}${doctorId}`,
    SK: `${ID_PREFIX}${doctorId}`,
  };
}

@Injectable()
export class DoctorsService {
  async create(createDoctorDto: CreateDoctorDto) {
    const createdAt = new Date();
    const primaryKey = generateDoctorItemKey(createDoctorDto.id);
    /* for fetching tests */
    const GSI1PK = primaryKey.PK;
    const GSI1SK = primaryKey.SK;

    /* for listing by specialization */
    const specialization = createDoctorDto.specialization.toUpperCase();
    const GSI2PK = `SPECIALIZATION#${specialization}`;
    const GSI2SK = `${specialization}#${createDoctorDto.id}`;

    const command = new PutCommand({
      TableName: DATA_TABLE,
      Item: {
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
      },
    });
    const result = await client.send(command);
    return result;
  }

  async one(doctorId: string) {
    const key = generateDoctorItemKey(doctorId);
    const command = new GetCommand({
      TableName: DATA_TABLE,
      Key: key,
    });
    const { Item } = await client.send(command);
    return Item;
  }

  async update(doctorId: string, updateDoctorDto: UpdateDoctorDto) {
    const key = generateDoctorItemKey(doctorId);
    const updateExpressionAndValues = objToUpdateExpression(updateDoctorDto);
    const command = new UpdateCommand({
      TableName: DATA_TABLE,
      Key: key,
      ...updateExpressionAndValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await client.send(command);
    return result;
  }

  async remove(doctorId: string) {
    const key = generateDoctorItemKey(doctorId);
    const command = new DeleteCommand({
      TableName: DATA_TABLE,
      Key: key,
    });
    const result = await client.send(command);
    return result;
  }

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
  /* and list method */
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
