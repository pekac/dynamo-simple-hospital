import { Controller, Get, Module } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import {
  getSpecializationsQuery,
  NoSpecializationsFoundException,
} from '../common';

class GetSpecializationsQuery {}

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
  async execute() {
    const specializations = await getSpecializationsQuery();
    if (specializations.length === 0) {
      throw new NoSpecializationsFoundException();
    }

    return specializations;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetSpecializationsController],
  providers: [GetSpecializationsHandler],
})
export class GetSpecializationsModule {}
