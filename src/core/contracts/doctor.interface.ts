import { Doctor, Patient } from '../entities';

export abstract class IDoctorsResource {
  abstract create(createDoctorDto: Doctor): Promise<Doctor | undefined>;
  abstract one(doctorId: string): Promise<Doctor | undefined>;
  abstract update(
    doctorId: string,
    updateDoctorDto: Partial<Doctor>,
  ): Promise<Doctor>;
  abstract remove(doctorId: string): Promise<string>;
  abstract list(
    startCollection: string,
    limit: number,
    lastSeen: string,
  ): Promise<Doctor[]>;
  abstract addPatient(
    doctorId: string,
    addPatientDto: Partial<Patient>,
  ): Promise<any>;
  abstract removePatientFromDoctor(
    doctorId: string,
    patientId: string,
  ): Promise<any>;
  abstract listDoctorsForPatient(
    patientId: string,
    limit?: number,
    lastSeen?: string,
  ): Promise<Doctor[]>;
}
