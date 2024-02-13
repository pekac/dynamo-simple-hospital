import { Module } from '@nestjs/common';

import {
  DoctorsModule,
  PatientsModule,
  SpecializationsModule,
  TestsModule,
} from './modules';

@Module({
  imports: [DoctorsModule, PatientsModule, SpecializationsModule, TestsModule],
})
export class AppModule {}
