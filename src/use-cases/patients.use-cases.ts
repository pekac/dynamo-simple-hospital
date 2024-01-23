import { Injectable } from '@nestjs/common';
/* interfaces */
import { IPatientsService } from '../interfaces/patient-service.interface';
import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';

@Injectable()
export class PatientsUseCases {
  constructor(private patientsService: IPatientsService) {}

  getPatientById(patientId: string) {
    return this.patientsService.one(patientId);
  }

  createPatient(createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  updatePatient(patientId: string, updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(patientId, updatePatientDto);
  }

  deletePatient(patientId: string) {
    return this.patientsService.remove(patientId);
  }
}
