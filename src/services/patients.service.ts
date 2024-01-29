import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';

import { client, DATA_TABLE } from '../dynamo/';

import { capitalize, Resource, truncateDateToWeek } from '../utils/';

import { Patient } from 'src/entities/patient.entity';

const ID_PREFIX = 'PATIENT#';

@Injectable()
export class PatientsService extends Resource<Patient> {
  constructor() {
    super(Patient, ID_PREFIX);
  }

  async create(createPatientDto: Patient): Promise<Patient | undefined> {
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
      TableName: DATA_TABLE,
      Item: item,
    });
    try {
      await client.send(command);
      return this.mapToEntity(item);
    } catch (e) {
      console.log('Error: ', e.message);
      return undefined;
    }
  }

  // async one(patientId: string) {
  //   const key = generatePatientItemKey(patientId);
  //   const command = new GetCommand({
  //     TableName: DATA_TABLE,
  //     Key: key,
  //   });
  //   const { Item } = await client.send(command);
  //   return Item;
  // }

  // async update(patientId: string, updatePatientDto: UpdatePatientDto) {
  //   const key = generatePatientItemKey(patientId);
  //   const updateExpressionAndValues = objToUpdateExpression(updatePatientDto);
  //   const command = new UpdateCommand({
  //     TableName: DATA_TABLE,
  //     Key: key,
  //     ...updateExpressionAndValues,
  //     ReturnValues: 'ALL_NEW',
  //   });
  //   const result = await client.send(command);
  //   return result;
  // }

  // async remove(patientId: string) {
  //   const key = generatePatientItemKey(patientId);
  //   const command = new DeleteCommand({
  //     TableName: DATA_TABLE,
  //     Key: key,
  //   });
  //   const result = await client.send(command);
  //   return result;
  // }

  // async listByLastName(
  //   collection: string = 'A',
  //   lastSeen: string = 'A',
  //   limit: number = 20,
  // ): Promise<GetPatientDto[]> {
  //   const command = new QueryCommand({
  //     TableName: DATA_TABLE,
  //     IndexName: 'GSI1',
  //     KeyConditionExpression: '#pk = :pk AND #sk > :sk',
  //     ExpressionAttributeNames: {
  //       '#pk': 'GSI1PK',
  //       '#sk': 'GSI1SK',
  //     },
  //     ExpressionAttributeValues: {
  //       ':pk': `${ID_PREFIX}${collection}`,
  //       ':sk': `${ID_PREFIX}${lastSeen}`,
  //     },
  //     Limit: limit,
  //   });

  //   const { Items } = await client.send(command);
  //   return Items as GetPatientDto[];
  // }

  // async listByCreatedAt(
  //   collection: string = truncateDateToWeek(new Date()).toISOString(),
  //   lastSeen: string = new Date().toISOString(),
  //   limit: number = 20,
  // ) {
  //   const command = new QueryCommand({
  //     TableName: DATA_TABLE,
  //     IndexName: 'GSI2',
  //     KeyConditionExpression: '#pk = :pk AND #sk < :sk',
  //     ExpressionAttributeNames: {
  //       '#pk': 'GSI2PK',
  //       '#sk': 'GSI2SK',
  //     },
  //     ExpressionAttributeValues: {
  //       ':pk': `${ID_PREFIX}${collection}`,
  //       ':sk': `${ID_PREFIX}${lastSeen}`,
  //     },
  //     ScanIndexForward: false,
  //     Limit: limit,
  //   });

  //   const { Items } = await client.send(command);
  //   return Items;
  // }
}
