import { Injectable } from '@nestjs/common';

import { CreatePatientDto, IPatientsResource, Patient } from 'src/core';

import { capitalize, truncateDateToWeek } from 'src/utils';

import { PATIENT_ID_PREFIX } from '../constants';

import { ItemKey, Resource } from '../resource';

@Injectable()
export class PatientsResource
  extends Resource<Patient>
  implements IPatientsResource
{
  constructor() {
    super({ entityTemplate: Patient, pkPrefix: PATIENT_ID_PREFIX });
  }

  addPatient(dto: CreatePatientDto): Promise<string | undefined> {
    return this.create({
      dto,
      decorator: decoratePatient,
    });
  }
}

function decoratePatient(
  patient: CreatePatientDto & ItemKey & { createdAt: Date },
) {
  const firstLetter = patient.lastName.charAt(0);
  return {
    ...patient,
    createdAt: patient.createdAt.toISOString(),
    /* list by last name */
    GSI1PK: `${PATIENT_ID_PREFIX}${capitalize(firstLetter)}`,
    GSI1SK: `${PATIENT_ID_PREFIX}${patient.lastName.toUpperCase()}-${patient.id}`,
    /* list by created at */
    GSI2PK: `${PATIENT_ID_PREFIX}${truncateDateToWeek(patient.createdAt).toISOString()}`,
    GSI2SK: `${PATIENT_ID_PREFIX}${patient.createdAt.toISOString()}`,
    /* for listing doctors */
    GSI3PK: patient.PK,
    GSI3SK: patient.SK,
  };
}
