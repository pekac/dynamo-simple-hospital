import { Injectable } from '@nestjs/common';

import { CreateDoctorDto, UpdateDoctorDto } from '../dtos';
import { IDoctorsService } from 'src/interfaces';

@Injectable()
export class DoctorsUseCases {
  constructor(private doctorsService: IDoctorsService) {}

  createDoctor(createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  getDoctorById(doctorId: string) {
    return this.doctorsService.one(doctorId);
  }

  updateDoctor(doctorId: string, updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(doctorId, updateDoctorDto);
  }
}
