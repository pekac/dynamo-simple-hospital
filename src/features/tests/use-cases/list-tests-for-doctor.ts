import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import { DOCTOR_ID_PREFIX, TEST_SK_PREFIX, Test } from 'src/core';

import { DATA_TABLE, client, projectionGenerator } from 'src/dynamo';

import { ListTestsParamsDto, NoTestsFoundForDoctorException } from '../common';

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
  async listTestsForDoctor(
    doctorId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<Test[]> {
    const { projectionExpression, projectionNames } = projectionGenerator(Test);

    const PK = `${DOCTOR_ID_PREFIX}${doctorId}`;
    const SK = lastSeen === '$' ? PK : `${TEST_SK_PREFIX}${lastSeen}`;
    const command = new QueryCommand({
      TableName: DATA_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: '#pk = :pk AND #sk < :sk',
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: {
        '#pk': 'GSI1PK',
        '#sk': 'GSI1SK',
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
    doctorId,
    limit = 20,
    lastSeen = '$',
  }: ListTestsForDoctorQuery): Promise<Test[]> {
    const tests = await this.listTestsForDoctor(doctorId, limit, lastSeen);

    if (tests.length === 0) {
      throw new NoTestsFoundForDoctorException(doctorId);
    }

    return tests;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListTestsForDoctorController],
  providers: [ListTestsForDoctorHandler],
})
export class ListTestsForDoctorModule {}
