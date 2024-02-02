import { Patient } from '../entities';

import { CreatePatientDto, UpdatePatientDto } from '../dtos/';

export abstract class IPatientsService {
  abstract create(
    createPatientDto: CreatePatientDto,
  ): Promise<Patient | undefined>;
  abstract one(patientId: string): Promise<Patient | undefined>;
  abstract update(
    patientId: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient>;
  abstract remove(patientId: string): Promise<string>;
  abstract listByLastName(
    startCollection: string,
    limit: number,
    lastSeen: string,
  ): Promise<Patient[]>;
  abstract listByCreatedAt(
    startCollection: string,
    limit: number,
    lastSeen: string,
  ): Promise<Patient[]>;
  abstract listDoctors(
    patientId: string,
    limit: number,
    lastSeen: string,
  ): Promise<Patient[]>;
}
