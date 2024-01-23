import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';

export abstract class IPatientsService {
  abstract create(createPatientDto: CreatePatientDto): Promise<string>;
  abstract one(patientId: string): Promise<string>;
  abstract update(
    patientId: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<string>;
  abstract remove(patientId: string): Promise<string>;
  abstract listByLastName(
    startCollection: string,
    lastSeen: string,
    limit: number,
  ): Promise<string>;
  abstract listByCreatedAt(): Promise<string>;
}
