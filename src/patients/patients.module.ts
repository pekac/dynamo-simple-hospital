import { Module } from '@nestjs/common';

import {
  CreatePatientModule,
  DeletePatientModule,
  GetPatientModule,
  ListPatientsForDoctorModule,
  UpdatePatientModule,
} from './use-cases';

@Module({
  imports: [
    CreatePatientModule,
    DeletePatientModule,
    GetPatientModule,
    ListPatientsForDoctorModule,
    UpdatePatientModule,
  ],
})
export class PatientsModule {}
