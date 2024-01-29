import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateDoctorDto, ListDoctorsDto, UpdateDoctorDto } from '../dtos';

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
  updateDoctor(
    @Param('id') doctorId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsUseCases.updateDoctor(doctorId, updateDoctorDto);
  }

  @Delete(':id')
  deleteDoctor(@Param('id') doctorId: string) {
    return this.doctorsUseCases.deleteDoctor(doctorId);
  }

  @Get('?')
  getDoctorList(@Query() queryParams: ListDoctorsDto) {
    return this.doctorsUseCases.getDoctorList(queryParams);
  }
}
