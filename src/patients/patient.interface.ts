import { Patient } from './patient.entity';

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
  abstract listPatientsForDoctor(
    doctorId: string,
    limit: number,
    lastSeen: string,
  ): Promise<Patient[]>;
}
