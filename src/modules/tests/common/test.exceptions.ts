import { ConflictException, NotFoundException } from '@nestjs/common';

export class TestNotFoundException extends NotFoundException {
  constructor(testId: string) {
    super(`Test, ID '${testId}', not found`);
  }
}

export class TestAlreadyExistsException extends ConflictException {
  constructor(testId: string) {
    super(`Test, ID ${testId}, already exists`);
  }
}

export class NoTestsFoundForDoctorException extends NotFoundException {
  constructor(doctorId: string) {
    super(`No tests found for doctor with ID ${doctorId}`);
  }
}
