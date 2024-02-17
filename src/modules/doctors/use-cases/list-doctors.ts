import { Controller, Get, Module, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Doctor } from '../../../core';

import { DATA_TABLE, client, crossPartitionEntityList } from '../../../dynamo';

import { ListDoctorsDto } from '../doctor.dto';

import { NoDoctorsFoundException } from '../doctor.exceptions';

/* should move specialization to a submodule */
import { ISpecializationService } from '../../specializations/specialization.interface';
import { SpecializationService } from '../../specializations/specialization.service';

import { arraySubset } from '../../../utils';
import { capitalize } from 'lodash';

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
    const shell = new Doctor();

    const keys = Object.keys(shell).map((key) => `#${key}`);

    const projectionNames = keys.reduce(
      (acc, key) => {
        acc[key] = capitalize(key.substring(1));
        return acc;
      },
      {} as Record<string, string>,
    );

    const command = new QueryCommand({
      TableName: DATA_TABLE,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :pk AND #sk > :sk',
      ProjectionExpression: keys.join(', '),
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

  async listBySpecialization(queryParams: ListDoctorsDto) {
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
      this.list(col, limit, lastSeen);

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

  async execute({ queryParams }: ListDoctorsQuery) {
    // const doctors = await this.listBySpecialization(queryParams);
    // if (doctors.length === 0) {
    //   throw new NoDoctorsFoundException();
    // }
    // return doctors;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListDoctorsController],
  providers: [
    ListDoctorsHandler,
    { provide: ISpecializationService, useClass: SpecializationService },
  ],
})
export class ListDoctorsModule {}
