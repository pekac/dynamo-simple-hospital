import { Injectable } from '@nestjs/common';

import { CreateDoctorDto, DOCTOR_ID_PREFIX, Doctor } from 'src/core';

import { CreateItem, ItemKey, Resource, isCreateItem } from '../resource';

@Injectable()
export class DoctorsResource extends Resource<Doctor> {
  constructor() {
    super({ entityTemplate: Doctor, pkPrefix: DOCTOR_ID_PREFIX });
  }

  create(
    dto: CreateDoctorDto | CreateItem<Doctor>,
  ): Promise<string | undefined> {
    if (isCreateItem(dto)) {
      throw new TypeError(`Dto is not of shape CreateDoctorDto`);
    }

    return super.create({
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
