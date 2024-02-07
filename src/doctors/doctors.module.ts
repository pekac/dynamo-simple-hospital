import { Module } from '@nestjs/common';
import {
  AssignPatientToDoctorModule,
  CreateDoctorModule,
  DeleteDoctorModule,
  GetDoctorModule,
  ListDoctorsModule,
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
    RemovePatientFromDoctorModule,
    UpdateDoctorModule,
  ],
})
export class DoctorsModule {}
