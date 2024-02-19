import { Injectable } from '@nestjs/common';
import { DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { AssignPatientToDoctorDto } from './doctor.dto';

import { DOCTOR_ID_PREFIX, PATIENT_ID_PREFIX, Doctor } from '../../core';

import { Resource } from '../../dynamo/';

@Injectable()
export class DoctorsService extends Resource<Doctor> {
  constructor() {
    super(Doctor, DOCTOR_ID_PREFIX);
  }

  async addPatient(
    doctorId: string,
    addPatientDto: AssignPatientToDoctorDto,
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
}
