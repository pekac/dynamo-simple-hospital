import { Controller, Get, Module, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Patient } from 'src/core';

import {
  DATA_TABLE,
  client,
  crossPartitionEntityList,
  projectionGenerator,
  PATIENT_ID_PREFIX,
} from 'src/dynamo';

import { truncateDateToWeek } from 'src/utils';

import { ListPatientsDto } from '../common';

/* unicode @ is > then numbers */
const LAST_SEEN_CREATED_AT = '@';

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
  async listByLastName(
    collection: string = 'A',
    limit: number = 20,
    lastSeen: string = 'A',
  ): Promise<Patient[]> {
    const { projectionExpression, projectionNames } =
      projectionGenerator(Patient);

    const command = new QueryCommand({
      TableName: DATA_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: '#pk = :pk AND #sk > :sk',
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: {
        '#pk': 'GSI1PK',
        '#sk': 'GSI1SK',
        ...projectionNames,
      },
      ExpressionAttributeValues: {
        ':pk': `${PATIENT_ID_PREFIX}${collection}`,
        ':sk': `${PATIENT_ID_PREFIX}${lastSeen}`,
      },
      Limit: limit,
    });

    const { Items = [] } = await client.send(command);
    return Items as Patient[];
  }

  async listByCreatedAt(
    collection: string,
    limit: number = 20,
    lastSeen: string,
  ): Promise<Patient[]> {
    const { projectionExpression, projectionNames } =
      projectionGenerator(Patient);
    const command = new QueryCommand({
      TableName: DATA_TABLE,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :pk AND #sk < :sk',
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: {
        '#pk': 'GSI2PK',
        '#sk': 'GSI2SK',
        ...projectionNames,
      },
      ExpressionAttributeValues: {
        ':pk': `${PATIENT_ID_PREFIX}${collection}`,
        ':sk': `${PATIENT_ID_PREFIX}${lastSeen}`,
      },
      ScanIndexForward: false,
      Limit: limit,
    });

    const { Items = [] } = await client.send(command);
    return Items as Patient[];
  }

  async getPatientsByCreatedAt({
    lastSeen = LAST_SEEN_CREATED_AT,
    limit,
  }: ListPatientsDto): Promise<Patient[]> {
    const firstCollection = truncateDateToWeek(new Date()).toISOString();
    const lastCollection = truncateDateToWeek(
      new Date(2024, 0, 1),
    ).toISOString();

    const shouldContinue = (col: string) => col >= lastCollection;

    const updateCollection = (
      col: string,
      lastSeenPatient: Patient & { createdAt: string },
    ): { collection: string; lastSeen: string } => {
      const sevenDaysAgo = new Date(col);
      sevenDaysAgo.setDate(new Date(col).getDate() - 7);
      return {
        collection: truncateDateToWeek(sevenDaysAgo).toISOString(),
        lastSeen: lastSeenPatient?.createdAt || LAST_SEEN_CREATED_AT,
      };
    };

    const collection =
      lastSeen === LAST_SEEN_CREATED_AT
        ? firstCollection
        : truncateDateToWeek(new Date(lastSeen)).toISOString();

    return crossPartitionEntityList({
      collection,
      lastSeen,
      limit,
      getItems: this.listByCreatedAt,
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

    const updateCollection = (
      col: string,
      lastSeenPatient: Patient,
    ): { collection: string; lastSeen: string } => {
      return {
        collection: String.fromCharCode(col.charCodeAt(0) + 1),
        lastSeen: lastSeenPatient
          ? `${lastSeenPatient?.lastName?.toUpperCase()}-${lastSeenPatient?.id}`
          : '$',
      };
    };

    return crossPartitionEntityList({
      collection: lastSeen === '$' ? firstCollection : lastSeen.charAt(0),
      lastSeen,
      limit,
      getItems: this.listByLastName,
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
  providers: [ListPatientsHandler],
})
export class ListPatientsModule {}
