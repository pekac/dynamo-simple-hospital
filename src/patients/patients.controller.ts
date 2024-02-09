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

import {
  CreatePatientDto,
  ListPatientsDto,
  ListPatientsForDoctorDto,
  UpdatePatientDto,
} from './patient.dto';

import { PatientsUseCases } from './patients.use-cases';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsUseCase: PatientsUseCases) {}
  @Get('?')
  getPatientList(@Query() queryParams: ListPatientsDto) {
    return this.patientsUseCase.getPatientList(queryParams);
  }

  @Get(':id')
  getPatientById(@Param('id') id: string) {
    return this.patientsUseCase.getPatientById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsUseCase.createPatient(createPatientDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  updatePatient(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsUseCase.updatePatient(id, updatePatientDto);
  }

  @Delete(':id')
  deletePatient(@Param('id') id: string) {
    return this.patientsUseCase.deletePatient(id);
  }

  @Get('doctors/doctorId/patients')
  listPatientsForADoctor(
    @Param('doctorId') doctorId: string,
    @Query() queryParams: ListPatientsForDoctorDto,
  ) {
    return this.patientsUseCase.listPatientsForDoctor(
      doctorId,
      queryParams.limit,
      queryParams.lastSeen,
    );
  }
}
