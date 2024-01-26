import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateDoctorDto } from '../dtos';

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
}
