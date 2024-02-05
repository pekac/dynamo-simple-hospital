import { Doctor, Patient } from '../entities';

export abstract class IDoctorsService {
  abstract create(createDoctorDto: Doctor): Promise<Doctor | undefined>;
  abstract one(doctorId: string): Promise<Doctor | undefined>;
  abstract update(
    doctorId: string,
    updateDoctorDto: Partial<Doctor>,
  ): Promise<Doctor>;
  abstract remove(doctorId: string): Promise<string>;
  abstract getSpecializations(): Promise<string[]>;
  abstract addNewSpecialization(specialization: string): Promise<string>;
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
  abstract listPatients(
    doctorId: string,
    limit: number,
    lastSeen: string,
  ): Promise<Patient[]>;
}
