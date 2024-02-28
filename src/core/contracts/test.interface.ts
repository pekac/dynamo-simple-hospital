import { CreateTestDto } from '../dto';

import { Test } from '../entities';

export abstract class ITestsResource {
  abstract addTest(
    patientId: string,
    createTestDto: CreateTestDto,
  ): Promise<string | undefined>;
  abstract one(patientId: string, testId: string): Promise<Test | undefined>;
  abstract remove(patientId: string, testId: string): Promise<string>;
}
