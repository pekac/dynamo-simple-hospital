import {
  AddPatientToDoctorDto,
  CreateDoctorDto,
  UpdateDoctorDto,
} from '../dtos/';

import { Patient } from '../entities';

export abstract class IDoctorsService {
  abstract create(createDoctorDto: CreateDoctorDto): Promise<string>;
  abstract one(doctorId: string): Promise<string>;
  abstract update(
    doctorId: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<string>;
  abstract remove(doctorId: string): Promise<string>;
  abstract getSpecializations(): Promise<string[]>;
  abstract addNewSpecialization(specialization: string): Promise<string>;
  abstract list(
    startCollection: string,
    limit: number,
    lastSeen: string,
  ): Promise<any>;
  abstract addPatient(
    doctorId: string,
    addPatientDto: AddPatientToDoctorDto,
  ): Promise<any>;
  abstract removePatientFromDoctor(
    doctorId: string,
    patientId: string,
  ): Promise<any>;
  abstract listPatients(
    doctorId: string,
    limit: number,
    lastSeen: string,
  ): Promise<Patient[]>;
}
