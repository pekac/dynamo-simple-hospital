import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';

import { Patient } from '../../core/patient.entity';

import { IPatientsService } from './patient.interface';

import { capitalize, truncateDateToWeek } from '../../utils';

import { DOCTOR_ID_PREFIX } from '../doctors/';

import { Resource } from '../../dynamo/';

export const PATIENT_ID_PREFIX = 'PATIENT#';

@Injectable()
export class PatientsService
  extends Resource<Patient>
  implements IPatientsService
{
  constructor() {
    super(Patient, PATIENT_ID_PREFIX);
  }

  async create(createPatientDto: Patient): Promise<Patient | undefined> {
    const primaryKey = this.generateItemKey(createPatientDto.id);
    /* list by last name */
    const firstLetter = createPatientDto.lastName.charAt(0);
    const GSI1PK = `${PATIENT_ID_PREFIX}${capitalize(firstLetter)}`;
    const GSI1SK = `${PATIENT_ID_PREFIX}${createPatientDto.lastName.toUpperCase()}`;
    /* list by created at */
    const createdAt = new Date();
    const GSI2PK = `${PATIENT_ID_PREFIX}${truncateDateToWeek(createdAt).toISOString()}`;
    const GSI2SK = `${PATIENT_ID_PREFIX}${createdAt.toISOString()}`;
    /* for listing doctors */
    const GSI3PK = primaryKey.PK;
    const GSI3SK = primaryKey.SK;

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
      GSI3PK,
      GSI3SK,
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

  async listPatientsForDoctor(
    doctorId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<Patient[]> {
    const PK = `${DOCTOR_ID_PREFIX}${doctorId}`;
    const SK = lastSeen === '$' ? PK : `${PATIENT_ID_PREFIX}${lastSeen}`;

    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: '#pk = :pk AND #sk > :sk',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': PK,
        ':sk': SK,
      },
      Limit: limit,
    });
    const { Items = [] } = await this.client.send(command);

    return Items.map((p) => {
      const [firstName, lastName] = p.PatientName.split(' ');
      return new Patient(p.PatientId, firstName, lastName);
    });
  }
}
