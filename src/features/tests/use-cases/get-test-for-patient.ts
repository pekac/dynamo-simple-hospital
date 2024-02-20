import { Controller, Get, Module, Param } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { Test, TestsResource } from 'src/core';

import { NoTestFoundForPatientException } from '../common';

class GetTestForPatientQuery {
  constructor(
    public readonly patientId: string,
    public readonly testId: string,
  ) {}
}

@Controller()
class GetTestForPatientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('patients/:patientId/tests/:testId')
  getTestForPatient(
    @Param('patientId') patientId: string,
    @Param('testId') testId: string,
  ) {
    return this.queryBus.execute(new GetTestForPatientQuery(patientId, testId));
  }
}

@QueryHandler(GetTestForPatientQuery)
class GetTestForPatientHandler
  implements IQueryHandler<GetTestForPatientQuery>
{
  constructor(private readonly tests: TestsResource) {}

  async execute({ patientId, testId }: GetTestForPatientQuery): Promise<Test> {
    const test = await this.tests.one(patientId, testId);

    if (!test) {
      throw new NoTestFoundForPatientException(patientId, testId);
    }

    return test;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetTestForPatientController],
  providers: [GetTestForPatientHandler, TestsResource],
})
export class GetTestForPatientModule {}
