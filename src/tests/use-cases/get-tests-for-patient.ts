import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { ListPatientTestsDto } from '../test.dto';

import { ITestsService } from '../test.interface';

import { TestsService } from '../tests.service';

class GetTestsForPatientQuery {
  constructor(
    public readonly patientId: string,
    public readonly queryParams: ListPatientTestsDto,
  ) {}
}

@Controller()
class GetTestsForPatientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('patients/:patientId/tests')
  getTestsForPatient(
    @Param('patientId') patientId: string,
    @Query() queryParams: ListPatientTestsDto,
  ) {
    return this.queryBus.execute(
      new GetTestsForPatientQuery(patientId, queryParams),
    );
  }
}

@QueryHandler(GetTestsForPatientQuery)
class GetTestsForPatientHandler
  implements IQueryHandler<GetTestsForPatientQuery>
{
  constructor(private readonly testsService: ITestsService) {}

  async execute({ patientId, queryParams }: GetTestsForPatientQuery) {
    const { limit, lastSeen } = queryParams;
    return this.testsService.listTestsForPatient(patientId, limit, lastSeen);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetTestsForPatientController],
  providers: [
    GetTestsForPatientHandler,
    { provide: ITestsService, useClass: TestsService },
  ],
})
export class GetTestsForPatientModule {}
