import { Controller, Get, Module } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { ISpecializationService } from '../specialization.interface';

import { SpecializationService } from '../specialization.service';

class GetSpecializationsQuery {
  constructor() {}
}

@Controller()
class GetSpecializationsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('specializations')
  getSpecializations() {
    return this.queryBus.execute(new GetSpecializationsQuery());
  }
}

@QueryHandler(GetSpecializationsQuery)
class GetSpecializationsHandler
  implements IQueryHandler<GetSpecializationsQuery>
{
  constructor(
    private readonly specializationsService: ISpecializationService,
  ) {}

  execute() {
    return this.specializationsService.getSpecializations();
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetSpecializationsController],
  providers: [
    GetSpecializationsHandler,
    { provide: ISpecializationService, useClass: SpecializationService },
  ],
})
export class GetSpecializationsModule {}
