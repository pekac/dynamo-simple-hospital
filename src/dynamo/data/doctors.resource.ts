import { Injectable } from '@nestjs/common';

import {
  CreateDoctorDto,
  DOCTOR_ID_PREFIX,
  Doctor,
  IDoctorsResource,
} from 'src/core';

import { ItemKey, Resource } from '../resource';

@Injectable()
export class DoctorsResource
  extends Resource<Doctor>
  implements IDoctorsResource
{
  constructor() {
    super({ entityTemplate: Doctor, pkPrefix: DOCTOR_ID_PREFIX });
  }

  addDoctor(dto: CreateDoctorDto): Promise<string | undefined> {
    return this.create({
      dto,
      decorator: decorateDoctor,
    });
  }
}

function decorateDoctor(doctor: CreateDoctorDto & ItemKey) {
  const specialization = doctor.specialization.toUpperCase();
  return {
    ...doctor,
    /* for fetching tests */
    GSI1PK: doctor.PK,
    GSI1SK: doctor.SK,
    /* for listing by specialization */
    specialization,
    GSI2PK: `SPECIALIZATION#${specialization}`,
    GSI2SK: `${specialization}#${doctor.id}`,
    /* for listing patients */
    GSI3PK: doctor.PK,
    GSI3SK: doctor.SK,
  };
}
