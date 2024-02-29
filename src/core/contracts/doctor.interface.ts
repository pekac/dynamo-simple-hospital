import { CreateDoctorDto } from '../dto';

import { Doctor } from '../entities';

export abstract class IDoctorsResource {
  abstract addDoctor(
    createDoctorDto: CreateDoctorDto,
  ): Promise<string | undefined>;
  abstract one(doctorId: string): Promise<Doctor | undefined>;
  abstract update(
    doctorId: string,
    updateDoctorDto: Partial<Doctor>,
  ): Promise<Doctor>;
  abstract remove(doctorId: string): Promise<string>;
}
