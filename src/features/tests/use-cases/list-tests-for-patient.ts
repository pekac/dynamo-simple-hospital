import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import { TEST_PK_PREFIX, TEST_SK_PREFIX, Test } from 'src/core';

import { DATA_TABLE, client, projectionGenerator } from 'src/dynamo';

import { ListTestsParamsDto, NoTestsFoundForPatientException } from '../common';

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
  async listTestsForPatient(
    patientId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<Test[]> {
    const PK = `${TEST_PK_PREFIX}${patientId}`;
    const SK = lastSeen === '$' ? PK : `${TEST_SK_PREFIX}${lastSeen}`;
    const { projectionExpression, projectionNames } = projectionGenerator(Test);

    const command = new QueryCommand({
      TableName: DATA_TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk < :sk',
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
        ...projectionNames,
      },
      ExpressionAttributeValues: {
        ':pk': PK,
        ':sk': SK,
      },
      ScanIndexForward: false,
      Limit: limit,
    });

    const { Items = [] } = await client.send(command);
    return Items as Test[];
  }

  async execute({
    patientId,
    limit = 20,
    lastSeen = '$',
  }: ListTestsForPatientQuery) {
    const tests = await this.listTestsForPatient(patientId, limit, lastSeen);

    if (tests.length === 0) {
      throw new NoTestsFoundForPatientException(patientId);
    }

    return tests;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListTestsForPatientController],
  providers: [ListTestsForPatientHandler],
})
export class ListTestsForPatientModule {}
