import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { ListPatientsForDoctorDto } from '../patient.dto';
import { IPatientsService } from '../patient.interface';
import { PatientsService } from '../patients.service';

class ListPatientsForDoctorQuery {
  constructor(
    public readonly doctorId: string,
    public readonly queryParams: ListPatientsForDoctorDto,
  ) {}
}

@Controller()
class ListPatientsForDoctorController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('doctors/:doctorId/patients')
  getPatientById(
    @Param('doctorId') doctorId: string,
    @Query() queryParams: ListPatientsForDoctorDto,
  ) {
    return this.queryBus.execute(
      new ListPatientsForDoctorQuery(doctorId, queryParams),
    );
  }
}

@QueryHandler(ListPatientsForDoctorQuery)
class ListPatientsForDoctorHandler
  implements IQueryHandler<ListPatientsForDoctorQuery>
{
  constructor(private readonly patientsService: IPatientsService) {}

  async execute({ doctorId, queryParams }: ListPatientsForDoctorQuery) {
    const { lastSeen, limit } = queryParams;
    return this.patientsService.listPatientsForDoctor(
      doctorId,
      limit,
      lastSeen,
    );
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListPatientsForDoctorController],
  providers: [
    ListPatientsForDoctorHandler,
    { provide: IPatientsService, useClass: PatientsService },
  ],
})
export class ListPatientsForDoctorModule {}
