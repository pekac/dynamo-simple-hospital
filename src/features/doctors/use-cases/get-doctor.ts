import { Controller, Get, Module, Param } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { DoctorsResource } from 'src/core';

import { DoctorNotFoundException } from '../common';

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
  constructor(private readonly doctors: DoctorsResource) {}

  async execute({ doctorId }: GetDoctorQuery) {
    const doctor = await this.doctors.one(doctorId);
    if (!doctor) {
      throw new DoctorNotFoundException(doctorId);
    }

    return doctor;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetDoctorController],
  providers: [DoctorsResource, GetDoctorHandler],
})
export class GetDoctorModule {}
