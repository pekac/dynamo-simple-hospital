import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { ListDoctorsForPatientDto } from '../doctor.dto';
import { IDoctorsService } from '../doctor.interface';
import { DoctorsService } from '../doctors.service';

class ListDoctorsForPatientQuery {
  constructor(
    public readonly patientId: string,
    public readonly queryParams: ListDoctorsForPatientDto,
  ) {}
}

@Controller()
class ListDoctorsForPatientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('patients/:patientId/doctors')
  getDoctorById(
    @Param('patientId') patientId: string,
    @Query() queryParams: ListDoctorsForPatientDto,
  ) {
    return this.queryBus.execute(
      new ListDoctorsForPatientQuery(patientId, queryParams),
    );
  }
}

@QueryHandler(ListDoctorsForPatientQuery)
class ListDoctorsForPatientHandler
  implements IQueryHandler<ListDoctorsForPatientQuery>
{
  constructor(private readonly doctorsService: IDoctorsService) {}

  async execute({ patientId, queryParams }: ListDoctorsForPatientQuery) {
    const { lastSeen, limit } = queryParams;
    return this.doctorsService.listDoctorsForPatient(
      patientId,
      limit,
      lastSeen,
    );
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListDoctorsForPatientController],
  providers: [
    ListDoctorsForPatientHandler,
    { provide: IDoctorsService, useClass: DoctorsService },
  ],
})
export class ListDoctorsForPatientModule {}
