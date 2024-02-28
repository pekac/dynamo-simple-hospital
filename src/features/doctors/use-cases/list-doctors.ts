import { Controller, Get, Module, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Doctor } from 'src/core';

import {
  DATA_TABLE,
  client,
  crossPartitionEntityList,
  projectionGenerator,
} from 'src/dynamo';

import { arraySubset } from 'src/utils';

import {
  getSpecializationsQuery,
  ListDoctorsDto,
  NoDoctorsFoundException,
  NoSpecializationsFoundException,
} from '../common';

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
  async list(
    specialization: string,
    limit: number = 5,
    lastSeen: string = '$',
  ): Promise<Doctor[]> {
    const { projectionExpression, projectionNames } =
      projectionGenerator(Doctor);

    const command = new QueryCommand({
      TableName: DATA_TABLE,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :pk AND #sk > :sk',
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: {
        '#pk': 'GSI2PK',
        '#sk': 'GSI2SK',
        ...projectionNames,
      },
      ExpressionAttributeValues: {
        ':pk': `SPECIALIZATION#${specialization}`,
        ':sk': `${specialization}#${lastSeen}`,
      },
      Limit: limit,
    });

    const { Items = [] } = await client.send(command);
    return Items as Doctor[];
  }

  async listDoctorsBySpecialization(
    {
      filterBy = [],
      lastSeen = '$',
      collection: lastCollection = '',
      limit = 5,
    }: ListDoctorsDto,
    specializations: string[],
  ) {
    const collections = (
      filterBy.length > 0
        ? arraySubset(
            specializations,
            filterBy.map((c) => c.toUpperCase()),
          )
        : specializations
    ).sort();

    const shouldContinue = (col: string) => collections.includes(col);

    const updateCollection = (col: string, lastSeenDoctor: Doctor) => {
      const index = collections.indexOf(col);
      return {
        collection:
          index < collections.length - 1 ? collections[index + 1] : 'THE_END',
        lastSeen: '$',
      };
    };

    return crossPartitionEntityList({
      collection: lastCollection?.toUpperCase() || collections[0],
      lastSeen: lastSeen,
      limit,
      getItems: this.list,
      shouldContinue,
      updateCollection,
    });
  }

  async execute({ queryParams }: ListDoctorsQuery) {
    const specializations = await getSpecializationsQuery();

    if (specializations.length === 0) {
      throw new NoSpecializationsFoundException();
    }

    const doctors = await this.listDoctorsBySpecialization(
      queryParams,
      specializations,
    );

    if (doctors.length === 0) {
      throw new NoDoctorsFoundException();
    }

    return doctors;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListDoctorsController],
  providers: [ListDoctorsHandler],
})
export class ListDoctorsModule {}
