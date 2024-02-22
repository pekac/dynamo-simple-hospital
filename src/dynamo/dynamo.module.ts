import { Module } from '@nestjs/common';

import {
  IDoctorPatientsResource,
  IDoctorsResource,
  IPatientsResource,
  ITestsResource,
} from 'src/core';

import {
  DoctorPatientsResource,
  DoctorsResource,
  PatientsResource,
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
      provide: ITestsResource,
      useClass: TestsResource,
    },
  ],
})
export class DynamoModule {}
