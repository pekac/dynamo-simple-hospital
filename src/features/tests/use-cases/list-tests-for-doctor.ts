import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { Test, TestsResource } from 'src/core';

import { ListTestsParamsDto, NoTestsFoundForDoctorException } from '../common';

class ListTestsForDoctorQuery {
  constructor(
    public readonly doctorId: string,
    public readonly limit?: number,
    public readonly lastSeen?: string,
  ) {}
}

@Controller()
class ListTestsForDoctorController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('doctors/:doctorId/tests')
  listTestsForDoctor(
    @Param('doctorId') doctorId: string,
    @Query() { limit, lastSeen }: ListTestsParamsDto,
  ) {
    return this.queryBus.execute(
      new ListTestsForDoctorQuery(doctorId, limit, lastSeen),
    );
  }
}

@QueryHandler(ListTestsForDoctorQuery)
class ListTestsForDoctorHandler
  implements IQueryHandler<ListTestsForDoctorQuery>
{
  constructor(private readonly tests: TestsResource) {}

  async execute({
    doctorId,
    limit = 20,
    lastSeen = '$',
  }: ListTestsForDoctorQuery): Promise<Test[]> {
    const tests = await this.tests.listTestsForDoctor(
      doctorId,
      limit,
      lastSeen,
    );

    if (tests.length === 0) {
      throw new NoTestsFoundForDoctorException(doctorId);
    }

    return tests;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListTestsForDoctorController],
  providers: [ListTestsForDoctorHandler],
})
export class ListTestsForDoctorModule {}
