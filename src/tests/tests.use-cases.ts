import { Injectable } from '@nestjs/common';

import { CreateTestDto } from './test.dto';

import { ITestsService } from './test.interface';

@Injectable()
export class TestsUseCases {
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
}
