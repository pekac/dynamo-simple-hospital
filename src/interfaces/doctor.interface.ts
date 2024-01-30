import { CreateDoctorDto, UpdateDoctorDto } from '../dtos/';

export abstract class IDoctorsService {
  abstract create(createDoctorDto: CreateDoctorDto): Promise<string>;
  abstract one(doctorId: string): Promise<string>;
  abstract update(
    doctorId: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<string>;
  abstract remove(doctorId: string): Promise<string>;
  abstract getSpecializations(): Promise<string[]>;
  abstract list(
    startCollection: string,
    limit: number,
    lastSeen: string,
  ): Promise<any>;
}
