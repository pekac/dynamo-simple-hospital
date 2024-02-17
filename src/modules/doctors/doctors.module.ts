import { Module } from '@nestjs/common';

import {
  AssignPatientToDoctorModule,
  CreateDoctorModule,
  CreateSpecializationModule,
  DeleteDoctorModule,
  GetDoctorModule,
  GetSpecializationsModule,
  ListDoctorsModule,
  ListDoctorsForPatientModule,
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
    ListDoctorsModule,
    ListDoctorsForPatientModule,
    RemovePatientFromDoctorModule,
    UpdateDoctorModule,
  ],
})
export class DoctorsModule {}
