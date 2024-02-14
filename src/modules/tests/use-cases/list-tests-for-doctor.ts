import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';

import { ListTestsParamsDto } from '../test.dto';

import { Test } from '../../../core/test.entity';

import { ITestsService } from '../test.interface';

import { TestsService } from '../tests.service';

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
  constructor(private readonly testsService: ITestsService) {}

  async execute({
    doctorId,
    limit = 20,
    lastSeen = '$',
  }: ListTestsForDoctorQuery): Promise<Test[]> {
    return this.testsService.listTestsForDoctor(doctorId, limit, lastSeen);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListTestsForDoctorController],
  providers: [
    ListTestsForDoctorHandler,
    { provide: ITestsService, useClass: TestsService },
  ],
})
export class ListTestsForDoctorModule {}
