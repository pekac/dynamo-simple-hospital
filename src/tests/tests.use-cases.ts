import { Injectable } from '@nestjs/common';

import { CreateTestDto } from './test.dto';

import { ITestsService } from './test.interface';

@Injectable()
export class PatientsUseCases {
  constructor(private testsService: ITestsService) {}

  /* tests */
  createTestForPatient(patientId: string, createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto, patientId);
  }

  getTestForPatient(patientId: string, testId: string) {
    return this.testsService.one(patientId, testId);
  }

  deleteTest(patientId: string, testId: string) {
    return this.testsService.remove(patientId, testId);
  }

  getTestsForPatient(
    patientId: string,
    limit: number = 3,
    lastSeen: string = '$',
  ) {
    return this.testsService.listTestsForPatient(patientId, limit, lastSeen);
  }
}
