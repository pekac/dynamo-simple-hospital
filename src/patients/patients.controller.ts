import { Controller, Get, Param, Query } from '@nestjs/common';

import { ListPatientsDto, ListPatientsForDoctorDto } from './patient.dto';

import { PatientsUseCases } from './patients.use-cases';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsUseCase: PatientsUseCases) {}
  @Get('?')
  getPatientList(@Query() queryParams: ListPatientsDto) {
    return this.patientsUseCase.getPatientList(queryParams);
  }

  @Get('doctors/:doctorId/patients')
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
