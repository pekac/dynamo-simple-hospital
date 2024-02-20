import { Controller, Get, Module, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';

import { Patient, PatientsResource } from 'src/core';

import { crossPartitionEntityList } from 'src/dynamo';

import { truncateDateToWeek } from 'src/utils';

import { ListPatientsDto } from '../common/patient.dto';

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
  constructor(private readonly patients: PatientsResource) {}
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
      this.patients.listByCreatedAt(col, limit, lastSeen);

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
      this.patients.listByLastName(col, limit, lastSeen.toUpperCase());

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

  async execute({ queryParams }: ListPatientsQuery) {
    if (queryParams.sortBy === 'lastName') {
      return this.getPatientsByLastName(queryParams);
    }

    return this.getPatientsByCreatedAt(queryParams);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListPatientsController],
  providers: [ListPatientsHandler, PatientsResource],
})
export class ListPatientsModule {}
