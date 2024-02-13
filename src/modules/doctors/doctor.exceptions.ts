import { ConflictException, NotFoundException } from '@nestjs/common';

export class DoctorNotFoundException extends NotFoundException {
  constructor(doctorId: string) {
    super(`Doctor with ID '${doctorId}' not found`);
  }
}

export class DoctorAlreadyExistsException extends ConflictException {
  constructor(doctorId: string) {
    super(`Doctor with ID ${doctorId} already exists`);
  }
}

export class NoDoctorsFoundException extends NotFoundException {
  constructor() {
    super('No doctors found');
  }
}

export class NoDoctorsFoundForPatientException extends NotFoundException {
  constructor(patientId: string) {
    super(`No doctors found for patient with ID ${patientId}`);
  }
}
