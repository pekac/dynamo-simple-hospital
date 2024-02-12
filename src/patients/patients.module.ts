import { Module } from '@nestjs/common';

import {
  CreatePatientModule,
  DeletePatientModule,
  GetPatientModule,
  ListPatientsForDoctorModule,
  ListPatientsModule,
  UpdatePatientModule,
} from './use-cases';

@Module({
  imports: [
    CreatePatientModule,
    DeletePatientModule,
    GetPatientModule,
    ListPatientsForDoctorModule,
    ListPatientsModule,
    UpdatePatientModule,
  ],
})
export class PatientsModule {}
