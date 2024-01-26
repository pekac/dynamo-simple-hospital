import { Injectable } from '@nestjs/common';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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

    const command = new PutCommand({
      TableName: DATA_TABLE,
      Item: {
        ...primaryKey,
        Id: createDoctorDto.id,
        FirstName: createDoctorDto.firstName,
        LastName: createDoctorDto.lastName,
        Specialization: createDoctorDto.specialization,
        CreatedAt: createdAt.toISOString(),
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
}
