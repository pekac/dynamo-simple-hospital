import { Controller, Get, Query } from '@nestjs/common';

import { ListPatientsDto } from './patient.dto';

import { PatientsUseCases } from './patients.use-cases';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsUseCase: PatientsUseCases) {}
  @Get('?')
  getPatientList(@Query() queryParams: ListPatientsDto) {
    return this.patientsUseCase.getPatientList(queryParams);
  }
}
