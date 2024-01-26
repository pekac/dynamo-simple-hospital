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
  CreateTestDto,
  ListPatientsDto,
  UpdatePatientDto,
} from '../dtos/';

import { PatientsUseCases } from '../use-cases/';

@Controller('patients')
export class PatientsController {
  constructor(private patientsUseCase: PatientsUseCases) {}
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
  /* tests */
  @Post(':patientId/tests')
  @UsePipes(new ValidationPipe())
  createTestForPatient(
    @Param('patientId') patientId: string,
    @Body() createTestDto: CreateTestDto,
  ) {
    return this.patientsUseCase.createTestForPatient(patientId, createTestDto);
  }

  @Get(':patientId/tests/:testId')
  getTestForPatient(
    @Param('patientId') patientId: string,
    @Param('testId') testId: string,
  ) {
    return this.patientsUseCase.getTestForPatient(patientId, testId);
  }

  @Delete(':patientId/tests/:testId')
  deleteTest(
    @Param('patientId') patientId: string,
    @Param('testId') testId: string,
  ) {
    return this.patientsUseCase.deleteTest(patientId, testId);
  }
}
