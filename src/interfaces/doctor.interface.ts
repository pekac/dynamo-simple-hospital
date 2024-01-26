import { CreateDoctorDto } from '../dtos/';

export abstract class IDoctorsService {
  abstract create(createDoctorDto: CreateDoctorDto): Promise<string>;
  abstract one(doctorId: string): Promise<string>;
}
