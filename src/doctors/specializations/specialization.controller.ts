import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { DoctorsUseCases } from './doctors.use-cases';

import { CreateSpecializationDto } from './specialization';

import { ListPatientsForDoctorDto } from '../patients';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsUseCases: DoctorsUseCases) {}
  /* specializations */
  @Post('specializations')
  @UsePipes(new ValidationPipe())
  createSpecialization(@Body() { specialization }: CreateSpecializationDto) {
    return this.doctorsUseCases.createSpecialization(specialization);
  }

  @Get('specializations')
  getSpecializations() {
    return this.doctorsUseCases.getSpecializations();
  }

  @Get(':id/patients')
  listPatients(
    @Param('id') doctorId: string,
    @Query() queryParams: ListPatientsForDoctorDto,
  ) {
    return this.doctorsUseCases.listPatients(
      doctorId,
      queryParams.limit,
      queryParams.lastSeen,
    );
  }
}
