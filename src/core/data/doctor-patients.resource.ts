import { Injectable } from '@nestjs/common';

import { DOCTOR_ID_PREFIX, DoctorPatient, PATIENT_ID_PREFIX } from '..';

import { Resource } from '../../dynamo';

@Injectable()
export class DoctorPatientsResource extends Resource<DoctorPatient> {
  constructor() {
    super({
      entityTemplate: DoctorPatient,
      pkPrefix: DOCTOR_ID_PREFIX,
      skPrefix: PATIENT_ID_PREFIX,
    });
  }
}
