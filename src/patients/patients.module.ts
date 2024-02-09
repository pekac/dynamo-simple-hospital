import { Module } from '@nestjs/common';

import {
  CreatePatientModule,
  DeletePatientModule,
  GetPatientModule,
  UpdatePatientModule,
} from './use-cases';

@Module({
  imports: [
    CreatePatientModule,
    DeletePatientModule,
    GetPatientModule,
    UpdatePatientModule,
  ],
})
export class PatientsModule {}
