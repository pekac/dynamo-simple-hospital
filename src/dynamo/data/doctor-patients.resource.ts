import { Injectable } from '@nestjs/common';

import {
  AssignPatientToDoctorDto,
  Doctor,
  DoctorPatient,
  IDoctorPatientsResource,
} from 'src/core';

import { PATIENT_ID_PREFIX, DOCTOR_ID_PREFIX } from '../constants';

import { ItemKey, Resource } from '../resource';

@Injectable()
export class DoctorPatientsResource
  extends Resource<DoctorPatient>
  implements IDoctorPatientsResource
{
  constructor() {
    super({
      entityTemplate: DoctorPatient,
      pkPrefix: DOCTOR_ID_PREFIX,
      skPrefix: PATIENT_ID_PREFIX,
    });
  }

  addPatient(
    doctor: Doctor,
    addPatientDto: AssignPatientToDoctorDto,
  ): Promise<string | undefined> {
    const decorator = generateDecorator(doctor);
    return this.create({ dto: addPatientDto, parentId: doctor.id, decorator });
  }

  removePatientFromDoctor(
    doctorId: string,
    patientId: string,
  ): Promise<string | undefined> {
    return this.remove(doctorId, patientId);
  }
}

function generateDecorator(doctor: Doctor) {
  return function decorateDoctorPatient(
    addPatientDto: AssignPatientToDoctorDto & ItemKey,
  ) {
    return {
      PK: addPatientDto.PK,
      SK: addPatientDto.SK,
      id: addPatientDto.id,
      patientName: `${addPatientDto.firstName} ${addPatientDto.lastName}`,
      patientId: addPatientDto.id,
      doctorName: `${doctor?.firstName} ${doctor?.lastName}`,
      specialization: doctor?.specialization,
      doctorId: doctor.id,
      GSI3PK: addPatientDto.SK,
      GSI3SK: addPatientDto.PK,
    };
  };
}
