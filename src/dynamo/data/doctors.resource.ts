import { Injectable } from '@nestjs/common';

import { DOCTOR_ID_PREFIX, Doctor } from 'src/core';

import { Resource } from '../resource';

@Injectable()
export class DoctorsResource extends Resource<Doctor> {
  constructor() {
    super({ entityTemplate: Doctor, pkPrefix: DOCTOR_ID_PREFIX });
  }
}
