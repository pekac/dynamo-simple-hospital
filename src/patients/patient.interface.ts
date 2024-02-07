import { Doctor, Patient } from '../entities';

export abstract class IPatientsService {
  abstract create(createPatientDto: Patient): Promise<Patient | undefined>;
  abstract one(patientId: string): Promise<Patient | undefined>;
  abstract update(
    patientId: string,
    updatePatientDto: Partial<Patient>,
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
  ): Promise<Doctor[]>;
}
