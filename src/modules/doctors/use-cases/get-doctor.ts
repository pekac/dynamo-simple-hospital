import { Controller, Get, Module, Param } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import {
  ITEM_BASED_ACTIONS,
  itemActionGenerator,
} from 'src/dynamo/resource-fn';

import { Doctor, DOCTOR_ID_PREFIX } from 'src/core';

import { DoctorNotFoundException } from '../doctor.exceptions';

interface IDoctorActions {
  one: (doctorId: string) => Promise<Doctor | undefined>;
}

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
  private readonly itemActions = itemActionGenerator(
    Doctor,
    [ITEM_BASED_ACTIONS.GET],
    DOCTOR_ID_PREFIX,
  ) as IDoctorActions;

  async execute({ doctorId }: GetDoctorQuery) {
    const doctor = await this.itemActions.one(doctorId);
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
