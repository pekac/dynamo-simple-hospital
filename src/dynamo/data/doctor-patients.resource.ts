import { Injectable } from '@nestjs/common';

import {
  AssignPatientToDoctorDto,
  DOCTOR_ID_PREFIX,
  Doctor,
  DoctorPatient,
  IDoctorPatientsResource,
  PATIENT_ID_PREFIX,
} from 'src/core';

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
    return super.create({ dto: addPatientDto, parentId: doctor.id, decorator });
  }

  removePatientFromDoctor(
    doctorId: string,
    patientId: string,
  ): Promise<string | undefined> {
    return super.remove(doctorId, patientId);
  }
}

function generateDecorator(doctor: Doctor) {
  return function decorateDoctorPatient(
    addPatientDto: AssignPatientToDoctorDto & ItemKey,
  ) {
    const doctorPK = `${DOCTOR_ID_PREFIX}${doctor.id}`;
    return {
      PatientName: `${addPatientDto.firstName} ${addPatientDto.lastName}`,
      PatientId: addPatientDto.id,
      DoctorName: `${doctor?.firstName} ${doctor?.lastName}`,
      Specialization: doctor?.specialization,
      DoctorId: doctor.id,
      PK: doctorPK,
      SK: addPatientDto.PK,
      GSI3PK: addPatientDto.PK,
      GSI3SK: doctorPK,
    };
  };
}
