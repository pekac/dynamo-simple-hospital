import { Controller, Get, Module, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { ListDoctorsDto } from '../doctor.dto';
import { IDoctorsService } from '../doctor.interface';
import { DoctorsService } from '../doctors.service';

import { crossPartitionEntityList } from '../../dynamo';

import { ISpecializationService } from '../../specializations/specialization.interface';

import { arraySubset } from '../../utils';

class ListDoctorsQuery {
  constructor(public readonly queryParams: ListDoctorsDto) {}
}

@Controller()
class ListDoctorsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('doctors?')
  getDoctorById(@Query() queryParams: ListDoctorsDto) {
    return this.queryBus.execute(new ListDoctorsQuery(queryParams));
  }
}

@QueryHandler(ListDoctorsQuery)
class ListDoctorsHandler implements IQueryHandler<ListDoctorsQuery> {
  constructor(
    private readonly doctorsService: IDoctorsService,
    private readonly specializationsService: ISpecializationService,
  ) {}

  async execute({ queryParams }: ListDoctorsQuery) {
    const {
      filterBy = [],
      lastSeen = '$',
      collection: lastCollection = '',
      limit = 5,
    } = queryParams;

    const specializations: string[] =
      (await this.specializationsService.getSpecializations()) || [];

    const collections = (
      filterBy.length > 0
        ? arraySubset(
            specializations,
            filterBy.map((c) => c.toUpperCase()),
          )
        : specializations
    ).sort();

    const shouldContinue = (col: string) => collections.includes(col);

    const getItems = (col: string, limit: number, lastSeen: string) =>
      this.doctorsService.list(col, limit, lastSeen);

    const updateCollection = (col: string, lastSeen: string = '$') => {
      const index = collections.indexOf(col);
      return {
        collection:
          index < collections.length - 1 ? collections[index + 1] : 'THE_END',
        lastSeen,
      };
    };

    return crossPartitionEntityList({
      collection: lastCollection?.toUpperCase() || collections[0],
      lastSeen: lastSeen,
      limit,
      getItems,
      shouldContinue,
      updateCollection,
    });
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListDoctorsController],
  providers: [
    ListDoctorsHandler,
    { provide: IDoctorsService, useClass: DoctorsService },
  ],
})
export class ListDoctorsModule {}
