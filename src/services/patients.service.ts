import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
/* entities */
import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';
/* utils */
import { client, DATA_TABLE } from '../dynamo/client';
import { objToUpdateExpression } from '../dynamo/helpers';
import { truncateDateToWeek } from '../utils/dates';
import { capitalize } from '../utils/text';

const ID_PREFIX = 'PATIENT#';

type Key = 'PK' | 'SK';
type ItemKey = {
  [key in Key]: string;
};

function generatePatientItemKey(patientId: string): ItemKey {
  return {
    PK: `${ID_PREFIX}${patientId}`,
    SK: `${ID_PREFIX}${patientId}`,
  };
}

@Injectable()
export class PatientsService {
  async create(createPatientDto: CreatePatientDto) {
    const primaryKey = generatePatientItemKey(createPatientDto.id);
    /* list by last name */
    const firstLetter = createPatientDto.lastName.charAt(0);
    const GSI1PK = `${ID_PREFIX}${capitalize(firstLetter)}`;
    const GSI1SK = `${ID_PREFIX}${createPatientDto.lastName.toUpperCase()}`;
    /* list by created at */
    const createdAt = new Date();
    const GSI2PK = truncateDateToWeek(createdAt).toISOString();
    const GSI2SK = createdAt.toISOString();

    const command = new PutCommand({
      TableName: DATA_TABLE,
      Item: {
        ...primaryKey,
        FirstName: createPatientDto.firstName,
        LastName: createPatientDto.lastName,
        Age: createPatientDto.age,
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

  async one(patientId: string) {
    const key = generatePatientItemKey(patientId);
    const command = new GetCommand({
      TableName: DATA_TABLE,
      Key: key,
    });
    const { Item } = await client.send(command);
    return Item;
  }

  async update(patientId: string, updatePatientDto: UpdatePatientDto) {
    const key = generatePatientItemKey(patientId);
    const updateExpressionAndValues = objToUpdateExpression(updatePatientDto);
    const command = new UpdateCommand({
      TableName: DATA_TABLE,
      Key: key,
      ...updateExpressionAndValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await client.send(command);
    return result;
  }

  async remove(patientId: string) {
    const key = generatePatientItemKey(patientId);
    const command = new DeleteCommand({
      TableName: DATA_TABLE,
      Key: key,
    });
    const result = await client.send(command);
    return result;
  }

  async listByLastName(
    collection: string = 'A',
    lastSeen: string = 'A',
    limit: number = 20,
  ) {
    const command = new QueryCommand({
      TableName: DATA_TABLE,
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

    const { Items } = await client.send(command);
    return Items;
  }

  async listByCreatedAt() {}
}
