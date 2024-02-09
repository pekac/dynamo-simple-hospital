import { Module } from '@nestjs/common';

import { DoctorsModule } from './doctors';

import { PatientsModule } from './patients';

import { SpecializationsModule } from './specializations';

@Module({
  imports: [DoctorsModule, PatientsModule, SpecializationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
