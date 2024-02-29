import { AssignPatientToDoctorDto } from '../dto';

import { Doctor, DoctorPatient } from '../entities';

export abstract class IDoctorPatientsResource {
  abstract one(
    doctorId: string,
    patientId: string,
  ): Promise<DoctorPatient | undefined>;
  abstract addPatient(
    doctor: Doctor,
    addPatientDto: AssignPatientToDoctorDto,
  ): Promise<string | undefined>;
  abstract removePatientFromDoctor(
    doctorId: string,
    patientId: string,
  ): Promise<string | undefined>;
}
