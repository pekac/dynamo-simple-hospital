import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import { DoctorPatient } from 'src/core';

import {
  DOCTOR_ID_PREFIX,
  DATA_TABLE,
  client,
  projectionGenerator,
  PATIENT_ID_PREFIX,
} from 'src/dynamo';

import {
  ListDoctorsForPatientDto,
  NoDoctorsFoundForPatientException,
} from '../common';

class ListDoctorsForPatientQuery {
  constructor(
    public readonly patientId: string,
    public readonly queryParams: ListDoctorsForPatientDto,
  ) {}
}

@Controller()
class ListDoctorsForPatientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('patients/:patientId/doctors')
  getDoctorById(
    @Param('patientId') patientId: string,
    @Query() queryParams: ListDoctorsForPatientDto,
  ) {
    return this.queryBus.execute(
      new ListDoctorsForPatientQuery(patientId, queryParams),
    );
  }
}

@QueryHandler(ListDoctorsForPatientQuery)
class ListDoctorsForPatientHandler
  implements IQueryHandler<ListDoctorsForPatientQuery>
{
  async listDoctorsForPatient(
    patientId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<DoctorPatient[]> {
    const PK = `${PATIENT_ID_PREFIX}${patientId}`;
    const SK = lastSeen === '$' ? PK : `${DOCTOR_ID_PREFIX}${lastSeen}`;

    const { projectionExpression, projectionNames } =
      projectionGenerator(DoctorPatient);

    const command = new QueryCommand({
      TableName: DATA_TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: '#pk = :pk AND #sk < :sk',
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: {
        '#pk': 'GSI3PK',
        '#sk': 'GSI3SK',
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
    return Items as DoctorPatient[];
  }

  async execute({ patientId, queryParams }: ListDoctorsForPatientQuery) {
    const { lastSeen, limit } = queryParams;
    const doctors = await this.listDoctorsForPatient(
      patientId,
      limit,
      lastSeen,
    );

    if (doctors.length === 0) {
      throw new NoDoctorsFoundForPatientException(patientId);
    }
    return doctors;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListDoctorsForPatientController],
  providers: [ListDoctorsForPatientHandler],
})
export class ListDoctorsForPatientModule {}
