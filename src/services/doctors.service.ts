import { Injectable } from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { CreateDoctorDto, UpdateDoctorDto } from '../dtos';

import { DATA_TABLE, client, objToUpdateExpression } from '../dynamo';

const ID_PREFIX = 'DOCTOR#';

type Key = 'PK' | 'SK';
type ItemKey = {
  [key in Key]: string;
};
/* 
TODO (services):
- [] extract service template 
- [] add id in attrs
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
        ':specialization': specialization,
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
    return Item;
  }
}
