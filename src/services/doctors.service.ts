import { Injectable } from '@nestjs/common';
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { AddPatientToDoctorDto, CreateDoctorDto } from '../dtos';

import { Doctor, Patient } from '../entities';

import { ID_PREFIX as PATIENT_ID_PREFIX } from './patients.service';

import { Resource } from '../utils';

const ID_PREFIX = 'DOCTOR#';

/* TODO:
- [x] model listing doctors
- [x] test doctor service
- [x] model many-to-many /w patients 
- [] update test service /w resource
- [] extract specialization service?
- [] standardize api response
- [] standardize pagination
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

    /* for listing patients */
    const GSI3PK = primaryKey.PK;
    const GSI3SK = primaryKey.SK;

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

  async list(
    specialization: string,
    limit: number = 5,
    lastSeen: string = '$',
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
        ':sk': `${specialization}#${lastSeen}`,
      },
      Limit: limit,
    });

    const { Items } = await this.client.send(command);
    return Items?.map((item) => this.mapToEntity(item)) as Doctor[];
  }

  async addPatient(
    doctorId: string,
    addPatientDto: AddPatientToDoctorDto,
  ): Promise<any> {
    const doctor = await this.one(doctorId);
    if (!doctor) {
      // throw not found err
      return;
    }

    const { PK: DoctorPK } = this.generateItemKey(doctorId);
    const PatientPK = `${PATIENT_ID_PREFIX}#${addPatientDto.id}`;

    const item = {
      PatientName: `${addPatientDto.firstName} ${addPatientDto.lastName}`,
      PatientId: addPatientDto.id,
      DoctorName: `${doctor?.firstName} ${doctor?.firstName}`,
      Specialization: doctor?.specialization,
      DoctorId: doctor.id,
      PK: DoctorPK,
      SK: PatientPK,
      GSI3PK: PatientPK,
      GSI3SK: DoctorPK,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    try {
      await this.client.send(command);
      return item;
    } catch (e) {
      return undefined;
    }
  }

  async listPatients(
    doctorId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<Patient[]> {
    const PK = `DOCTOR#${doctorId}`;
    const SK = lastSeen === '$' ? PK : `PATIENT#${lastSeen}`;

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

    const { Items } = await this.client.send(command);
    return Items?.map((p) => {
      const [firstName, lastName] = p.PatientName.split(' ');
      return new Patient(p.PatientId, firstName, lastName);
    }) as Patient[];
  }
}
