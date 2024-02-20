import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { TestsResource } from 'src/core';

import { ListTestsParamsDto, NoTestsFoundForPatientException } from '../common';

class ListTestsForPatientQuery {
  constructor(
    public readonly patientId: string,
    public readonly limit?: number,
    public readonly lastSeen?: string,
  ) {}
}

@Controller()
class ListTestsForPatientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('patients/:patientId/tests')
  getTestsForPatient(
    @Param('patientId') patientId: string,
    @Query() { limit, lastSeen }: ListTestsParamsDto,
  ) {
    return this.queryBus.execute(
      new ListTestsForPatientQuery(patientId, limit, lastSeen),
    );
  }
}

@QueryHandler(ListTestsForPatientQuery)
class ListTestsForPatientHandler
  implements IQueryHandler<ListTestsForPatientQuery>
{
  constructor(private readonly tests: TestsResource) {}

  async execute({
    patientId,
    limit = 20,
    lastSeen = '$',
  }: ListTestsForPatientQuery) {
    const tests = await this.tests.listTestsForPatient(
      patientId,
      limit,
      lastSeen,
    );

    if (tests.length === 0) {
      throw new NoTestsFoundForPatientException(patientId);
    }

    return tests;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListTestsForPatientController],
  providers: [ListTestsForPatientHandler, TestsResource],
})
export class ListTestsForPatientModule {}
