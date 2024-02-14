import { CreateTestDto } from './test.dto';

import { Test } from '../../core/test.entity';

export abstract class ITestsService {
  abstract create(
    createTestDto: CreateTestDto,
    patientId: string,
  ): Promise<Test | undefined>;
  abstract one(patientId: string, testId: string): Promise<Test | undefined>;
  abstract remove(patientId: string, testId: string): Promise<string>;
  abstract listTestsForPatient(
    patientId: string,
    limit: number,
    lastSeen: string,
  ): Promise<Test[]>;
  abstract listTestsForDoctor(
    doctorId: string,
    limit: number,
    lastSeen: string,
  ): Promise<Test[]>;
}
