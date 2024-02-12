import { Module } from '@nestjs/common';

import { DoctorsModule } from './doctors';

import { PatientsModule } from './patients';

import { SpecializationsModule } from './specializations';

import { TestsModule } from './tests';

@Module({
  imports: [DoctorsModule, PatientsModule, SpecializationsModule, TestsModule],
})
export class AppModule {}
