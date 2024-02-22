import { Module } from '@nestjs/common';

import {
  IDoctorPatientsResource,
  IDoctorsResource,
  IPatientsResource,
  ISpecializationResource,
  ITestsResource,
} from 'src/core';

import {
  DoctorPatientsResource,
  DoctorsResource,
  PatientsResource,
  SpecializationResource,
  TestsResource,
} from './data';

@Module({
  providers: [
    {
      provide: IDoctorsResource,
      useClass: DoctorsResource,
    },
    {
      provide: IDoctorPatientsResource,
      useClass: DoctorPatientsResource,
    },
    {
      provide: IPatientsResource,
      useClass: PatientsResource,
    },
    {
      provide: ISpecializationResource,
      useClass: SpecializationResource,
    },
    {
      provide: ITestsResource,
      useClass: TestsResource,
    },
  ],
})
export class DynamoModule {}
