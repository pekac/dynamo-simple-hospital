import { Injectable } from '@nestjs/common';
import { DeleteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Doctor } from './doctor.entity';

import { IDoctorsService } from './doctor.interface';

import { Patient, PATIENT_ID_PREFIX } from '../patients/';

import { Resource } from '../utils';

export const DOCTOR_ID_PREFIX = 'DOCTOR#';

@Injectable()
export class DoctorsService
  extends Resource<Doctor>
  implements IDoctorsService
{
  constructor() {
    super(Doctor, DOCTOR_ID_PREFIX);
  }

  async create(doctor: Doctor): Promise<Doctor | undefined> {
    const createdAt = new Date();
    const primaryKey = this.generateItemKey(doctor.id);
    /* for fetching tests */
    const GSI1PK = primaryKey.PK;
    const GSI1SK = primaryKey.SK;

    /* for listing by specialization */
    const specialization = doctor.specialization.toUpperCase();
    const GSI2PK = `SPECIALIZATION#${specialization}`;
    const GSI2SK = `${specialization}#${doctor.id}`;

    /* for listing patients */
    const GSI3PK = primaryKey.PK;
    const GSI3SK = primaryKey.SK;

    const item = {
      ...primaryKey,
      Id: doctor.id,
      FirstName: doctor.firstName,
      LastName: doctor.lastName,
      Specialization: doctor.specialization,
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

  async list(
    specialization: string,
    limit: number = 5,
    lastSeen: string = '$',
  ): Promise<Doctor[]> {
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

    const { Items = [] } = await this.client.send(command);
    return Items.map((item) => this.mapToEntity(item));
  }

  async addPatient(
    doctorId: string,
    addPatientDto: Partial<Patient>,
  ): Promise<any> {
    const doctor = await this.one(doctorId);
    if (!doctor) {
      // throw not found err
      return;
    }

    const { PK: DoctorPK } = this.generateItemKey(doctorId);
    const PatientPK = `${PATIENT_ID_PREFIX}${addPatientDto.id}`;

    const item = {
      PatientName: `${addPatientDto.firstName} ${addPatientDto.lastName}`,
      PatientId: addPatientDto.id,
      DoctorName: `${doctor?.firstName} ${doctor?.lastName}`,
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

  async removePatientFromDoctor(doctorId: string, patientId: string) {
    const { PK: DoctorPK } = this.generateItemKey(doctorId);
    const PatientPK = `${PATIENT_ID_PREFIX}${patientId}`;

    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { PK: DoctorPK, SK: PatientPK },
    });
    const result = await this.client.send(command);
    return result;
  }

  async listPatients(
    doctorId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<Patient[]> {
    const PK = this.generateItemKey(doctorId).PK;
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