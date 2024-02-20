import { ConflictException, NotFoundException } from '@nestjs/common';

export class PatientNotFoundException extends NotFoundException {
  constructor(patientId: string) {
    super(`Patient, ID '${patientId}', not found`);
  }
}

export class PatientAlreadyExistsException extends ConflictException {
  constructor(patientId: string) {
    super(`Patient, ID ${patientId}, already exists`);
  }
}

export class NoPatientsFoundForDoctorException extends NotFoundException {
  constructor(doctorId: string) {
    super(`No patients found for doctor with ID ${doctorId}`);
  }
}
