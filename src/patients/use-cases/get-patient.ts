import {
  Controller,
  Get,
  Module,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { IPatientsService } from '../patient.interface';
import { PatientsService } from '../patients.service';

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
  constructor(private readonly patientsService: IPatientsService) {}

  async execute({ patientId }: GetPatientQuery) {
    const patient = await this.patientsService.one(patientId);

    if (!patient) {
      throw new NotFoundException(`Patient with ID '${patientId}' not found`);
    }

    return patient;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetPatientController],
  providers: [
    GetPatientHandler,
    { provide: IPatientsService, useClass: PatientsService },
  ],
})
export class GetPatientModule {}
