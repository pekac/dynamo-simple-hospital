import { Controller, Get, Module, Param } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { ITestsService } from '../test.interface';

import { TestsService } from '../tests.service';

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
  constructor(private readonly testsService: ITestsService) {}

  async execute({ patientId, testId }: GetTestForPatientQuery) {
    return this.testsService.one(patientId, testId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetTestForPatientController],
  providers: [
    GetTestForPatientHandler,
    { provide: ITestsService, useClass: TestsService },
  ],
})
export class GetTestForPatientModule {}
