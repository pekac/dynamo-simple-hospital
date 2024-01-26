import { CreateTestDto } from '../dtos/';

export abstract class ITestsService {
  abstract create(
    patientId: string,
    createTestDto: CreateTestDto,
  ): Promise<string>;
  abstract one(patientId: string, testId: string): Promise<string>;
  abstract remove(patientId: string, testId: string): Promise<string>;
  abstract listTestsForPatient(
    patientId: string,
    lastSeen: string,
    limit: number,
  ): Promise<any>;
}
