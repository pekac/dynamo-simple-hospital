import { Controller, Get, Module, Param } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { IPatientsResource } from 'src/core';

import { PatientNotFoundException } from '../common';

class GetPatientQuery {
  constructor(public readonly patientId: string) {}
}

@Controller()
class GetPatientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('patients/:id')
  getPatientById(@Param('id') patientId: string) {
    return this.queryBus.execute(new GetPatientQuery(patientId));
  }
}

@QueryHandler(GetPatientQuery)
class GetPatientHandler implements IQueryHandler<GetPatientQuery> {
  constructor(private readonly patients: IPatientsResource) {}

  async execute({ patientId }: GetPatientQuery) {
    const patient = await this.patients.one(patientId);
    if (!patient) {
      throw new PatientNotFoundException(patientId);
    }

    return patient;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetPatientController],
  providers: [GetPatientHandler],
})
export class GetPatientModule {}
