import { Module } from '@nestjs/common';
import {
  AssignPatientToDoctorModule,
  CreateDoctorModule,
  DeleteDoctorModule,
  GetDoctorModule,
  ListDoctorsModule,
  ListDoctorsForPatientModule,
  RemovePatientFromDoctorModule,
  UpdateDoctorModule,
} from './use-cases';

@Module({
  imports: [
    AssignPatientToDoctorModule,
    CreateDoctorModule,
    DeleteDoctorModule,
    GetDoctorModule,
    ListDoctorsModule,
    ListDoctorsForPatientModule,
    RemovePatientFromDoctorModule,
    UpdateDoctorModule,
  ],
})
export class DoctorsModule {}
