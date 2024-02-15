import { Controller, Get, Module, Param } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import {
  ITEM_BASED_ACTIONS,
  itemBasedActionGenerator,
} from 'src/dynamo/resource-fn';

import { DoctorNotFoundException } from '../doctor.exceptions';

import { Doctor, DOCTOR_ID_PREFIX } from '../../../core';

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
  // private readonly one: (doctorId: string) => Promise<Doctor> =
  //   itemBasedActionGenerator(
  //     Doctor,
  //     DOCTOR_ID_PREFIX,
  //     DOCTOR_ID_PREFIX,
  //     ITEM_BASED_ACTIONS.GET,
  //   );

  async execute({ doctorId }: GetDoctorQuery) {
    // const doctor = await this.one(doctorId);
    // if (!doctor) {
    //   throw new DoctorNotFoundException(doctorId);
    // }
    // return doctor;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetDoctorController],
  providers: [GetDoctorHandler],
})
export class GetDoctorModule {}
