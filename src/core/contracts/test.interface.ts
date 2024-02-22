import { CreateTestDto } from '../dto';

import { Test } from '../entities';

export abstract class ITestsResource {
  abstract addTest(
    createTestDto: CreateTestDto,
    patientId: string,
  ): Promise<string | undefined>;
  abstract one(patientId: string, testId: string): Promise<Test | undefined>;
  abstract remove(patientId: string, testId: string): Promise<string>;
  // abstract listTestsForPatient(
  //   patientId: string,
  //   limit: number,
  //   lastSeen: string,
  // ): Promise<Test[]>;
  // abstract listTestsForDoctor(
  //   doctorId: string,
  //   limit: number,
  //   lastSeen: string,
  // ): Promise<Test[]>;
}
