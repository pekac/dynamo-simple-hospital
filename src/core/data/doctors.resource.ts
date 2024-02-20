import { Injectable } from '@nestjs/common';

import { DOCTOR_ID_PREFIX, Doctor } from '..';

import { Resource } from 'src/dynamo';

@Injectable()
export class DoctorsResource extends Resource<Doctor> {
  constructor() {
    super({ entityTemplate: Doctor, pkPrefix: DOCTOR_ID_PREFIX });
  }
}
