import { CreateTestDto } from '../dtos/test.dto';

export abstract class ITestsService {
  abstract create(
    patientId: string,
    createTestDto: CreateTestDto,
  ): Promise<string>;
  abstract one(patientId: string, testId: string): Promise<string>;
  // abstract update(
  //   patientId: string,
  //   updatePatientDto: UpdatePatientDto,
  // ): Promise<string>;
  // abstract remove(patientId: string): Promise<string>;
  // abstract listByLastName(
  //   startCollection: string,
  //   lastSeen: string,
  //   limit: number,
  // ): Promise<any>;
  // abstract listByCreatedAt(
  //   startCollection: string,
  //   lastSeen: string,
  //   limit: number,
  // ): Promise<any>;
}
