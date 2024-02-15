import { Controller, Get, Module, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { ListPatientsDto } from '../patient.dto';

import { Patient } from '../../../core/entities/patient.entity';

import { IPatientsService } from '../patient.interface';

import { PatientsService } from '../patients.service';

import { crossPartitionEntityList } from '../../../dynamo';

import { truncateDateToWeek } from '../../../utils';

class ListPatientsQuery {
  constructor(public readonly queryParams: ListPatientsDto) {}
}

@Controller()
class ListPatientsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('patients?')
  getPatientById(@Query() queryParams: ListPatientsDto) {
    return this.queryBus.execute(new ListPatientsQuery(queryParams));
  }
}

@QueryHandler(ListPatientsQuery)
class ListPatientsHandler implements IQueryHandler<ListPatientsQuery> {
  constructor(private readonly patientsService: IPatientsService) {}

  async execute({ queryParams }: ListPatientsQuery) {
    if (queryParams.sortBy === 'lastName') {
      return this.getPatientsByLastName(queryParams);
    }

    return this.getPatientsByCreatedAt(queryParams);
  }

  async getPatientsByCreatedAt({
    lastSeen = '$',
    limit,
  }: ListPatientsDto): Promise<Patient[]> {
    const firstCollection = truncateDateToWeek(new Date()).toISOString();
    const lastCollection = truncateDateToWeek(
      new Date(2024, 0, 1),
    ).toISOString();

    const shouldContinue = (col: string) => col >= lastCollection;

    const getItems = (col: string, limit: number) =>
      this.patientsService.listByCreatedAt(col, limit, lastSeen);

    const updateCollection = (
      col: string,
    ): { collection: string; lastSeen?: string } => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(new Date(col).getDate() - 7);
      return {
        collection: truncateDateToWeek(sevenDaysAgo).toISOString(),
      };
    };

    return crossPartitionEntityList({
      collection:
        lastSeen === '$'
          ? firstCollection
          : truncateDateToWeek(new Date(lastSeen)).toISOString(),
      limit,
      getItems,
      shouldContinue,
      updateCollection,
    });
  }

  async getPatientsByLastName({
    lastSeen = '$',
    limit,
  }: ListPatientsDto): Promise<Patient[]> {
    const firstCollection = 'A';
    const lastCollection = 'Z';

    const shouldContinue = (col: string) =>
      col.charCodeAt(0) <= lastCollection.charCodeAt(0);

    const getItems = (col: string, limit: number, lastSeen = '$') =>
      this.patientsService.listByLastName(col, limit, lastSeen.toUpperCase());

    const updateCollection = (
      col: string,
    ): { collection: string; lastSeen?: string } => {
      return {
        collection: String.fromCharCode(col.charCodeAt(0) + 1),
      };
    };

    return crossPartitionEntityList({
      collection: lastSeen === '$' ? firstCollection : lastSeen.charAt(0),
      limit,
      getItems,
      shouldContinue,
      updateCollection,
    });
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListPatientsController],
  providers: [
    ListPatientsHandler,
    { provide: IPatientsService, useClass: PatientsService },
  ],
})
export class ListPatientsModule {}
