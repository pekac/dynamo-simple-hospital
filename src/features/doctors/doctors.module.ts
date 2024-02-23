import { Module } from '@nestjs/common';

import {
  AssignPatientToDoctorModule,
  CreateDoctorModule,
  CreateSpecializationModule,
  DeleteDoctorModule,
  GetDoctorModule,
  GetSpecializationsModule,
  ListDoctorsForPatientModule,
  ListDoctorsModule,
  RemovePatientFromDoctorModule,
  UpdateDoctorModule,
} from './use-cases';

@Module({
  imports: [
    AssignPatientToDoctorModule,
    CreateDoctorModule,
    CreateSpecializationModule,
    DeleteDoctorModule,
    GetDoctorModule,
    GetSpecializationsModule,
    ListDoctorsForPatientModule,
    ListDoctorsModule,
    RemovePatientFromDoctorModule,
    UpdateDoctorModule,
  ],
})
export class DoctorsModule {}
