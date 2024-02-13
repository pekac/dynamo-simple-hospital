import { Module } from '@nestjs/common';

import {
  CreateTestForPatientModule,
  GetTestForPatientModule,
  ListTestsForDoctorModule,
  ListTestsForPatientModule,
} from './use-cases';

@Module({
  imports: [
    CreateTestForPatientModule,
    GetTestForPatientModule,
    ListTestsForDoctorModule,
    ListTestsForPatientModule,
  ],
})
export class TestsModule {}
