import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { ListTestsParamsDto } from '../common/test.dto';

import { ITestsService } from '../test.interface';

import { TestsService } from '../tests.service';

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
  constructor(private readonly testsService: ITestsService) {}

  async execute({
    patientId,
    limit = 20,
    lastSeen = '$',
  }: ListTestsForPatientQuery) {
    return this.testsService.listTestsForPatient(patientId, limit, lastSeen);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListTestsForPatientController],
  providers: [
    ListTestsForPatientHandler,
    { provide: ITestsService, useClass: TestsService },
  ],
})
export class ListTestsForPatientModule {}
