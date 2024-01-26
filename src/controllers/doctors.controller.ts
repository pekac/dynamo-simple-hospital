import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateDoctorDto, UpdateDoctorDto } from '../dtos';

import { DoctorsUseCases } from '../use-cases';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsUseCases: DoctorsUseCases) {}

  @Post()
  @UsePipes(new ValidationPipe())
  createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsUseCases.createDoctor(createDoctorDto);
  }

  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    return this.doctorsUseCases.getDoctorById(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  updatePatient(
    @Param('id') doctorId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsUseCases.updateDoctor(doctorId, updateDoctorDto);
  }

  @Delete(':id')
  deletePatient(@Param('id') doctorId: string) {
    return this.doctorsUseCases.deleteDoctor(doctorId);
  }
}
