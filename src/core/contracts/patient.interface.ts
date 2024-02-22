import { CreatePatientDto } from '../dto';

import { Patient } from '../entities';

export abstract class IPatientsResource {
  abstract addPatient(
    createPatientDto: CreatePatientDto,
  ): Promise<string | undefined>;
  abstract one(patientId: string): Promise<Patient | undefined>;
  abstract update(
    patientId: string,
    updatePatientDto: Partial<Patient>,
  ): Promise<Patient>;
  abstract remove(patientId: string): Promise<string>;
  // abstract listByLastName(
  //   startCollection: string,
  //   limit: number,
  //   lastSeen: string,
  // ): Promise<Patient[]>;
  // abstract listByCreatedAt(
  //   startCollection: string,
  //   limit: number,
  //   lastSeen: string,
  // ): Promise<Patient[]>;
  // abstract listPatientsForDoctor(
  //   doctorId: string,
  //   limit?: number,
  //   lastSeen?: string,
  // ): Promise<Patient[]>;
}
