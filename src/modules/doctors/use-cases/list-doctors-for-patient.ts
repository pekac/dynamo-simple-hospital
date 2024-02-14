import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { ListDoctorsForPatientDto } from '../doctor.dto';

import { NoDoctorsFoundForPatientException } from '../doctor.exceptions';

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
  constructor(private readonly doctorsService: DoctorsService) {}

  async execute({ patientId, queryParams }: ListDoctorsForPatientQuery) {
    const { lastSeen, limit } = queryParams;
    try {
      const doctors = await this.doctorsService.listDoctorsForPatient(
        patientId,
        limit,
        lastSeen,
      );

      if (doctors.length === 0) {
        throw new NoDoctorsFoundForPatientException(patientId);
      }

      return doctors;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListDoctorsForPatientController],
  providers: [ListDoctorsForPatientHandler],
})
export class ListDoctorsForPatientModule {}
