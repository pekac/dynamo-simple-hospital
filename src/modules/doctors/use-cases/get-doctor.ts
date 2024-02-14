import { Controller, Get, Module, Param } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { DoctorNotFoundException } from '../doctor.exceptions';

import { DoctorsService } from '../doctors.service';

class GetDoctorQuery {
  constructor(public readonly doctorId: string) {}
}

@Controller()
class GetDoctorController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('doctors/:id')
  getDoctorById(@Param('id') doctorId: string) {
    return this.queryBus.execute(new GetDoctorQuery(doctorId));
  }
}

@QueryHandler(GetDoctorQuery)
class GetDoctorHandler implements IQueryHandler<GetDoctorQuery> {
  constructor(private readonly doctorsService: DoctorsService) {}

  async execute({ doctorId }: GetDoctorQuery) {
    const doctor = await this.doctorsService.one(doctorId);

    if (!doctor) {
      throw new DoctorNotFoundException(doctorId);
    }

    return doctor;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetDoctorController],
  providers: [GetDoctorHandler],
})
export class GetDoctorModule {}
