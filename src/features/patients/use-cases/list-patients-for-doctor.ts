import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Patient } from 'src/core';

import {
  DOCTOR_ID_PREFIX,
  DATA_TABLE,
  client,
  projectionGenerator,
  PATIENT_ID_PREFIX,
} from 'src/dynamo';

import {
  ListPatientsForDoctorDto,
  NoPatientsFoundForDoctorException,
} from '../common';

class ListPatientsForDoctorQuery {
  constructor(
    public readonly doctorId: string,
    public readonly queryParams: ListPatientsForDoctorDto,
  ) {}
}

@Controller()
class ListPatientsForDoctorController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('doctors/:doctorId/patients')
  getPatientById(
    @Param('doctorId') doctorId: string,
    @Query() queryParams: ListPatientsForDoctorDto,
  ) {
    return this.queryBus.execute(
      new ListPatientsForDoctorQuery(doctorId, queryParams),
    );
  }
}

@QueryHandler(ListPatientsForDoctorQuery)
class ListPatientsForDoctorHandler
  implements IQueryHandler<ListPatientsForDoctorQuery>
{
  async listPatientsForDoctor(
    doctorId: string,
    limit: number = 20,
    lastSeen: string = '$',
  ): Promise<Patient[]> {
    const PK = `${DOCTOR_ID_PREFIX}${doctorId}`;
    const SK = lastSeen === '$' ? PK : `${PATIENT_ID_PREFIX}${lastSeen}`;

    const { projectionExpression, projectionNames } =
      projectionGenerator(Patient);

    const command = new QueryCommand({
      TableName: DATA_TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk > :sk',
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
      Limit: limit,
    });
    const { Items = [] } = await client.send(command);
    return Items as Patient[];
  }

  async execute({ doctorId, queryParams }: ListPatientsForDoctorQuery) {
    const { lastSeen, limit } = queryParams;

    const patients = await this.listPatientsForDoctor(
      doctorId,
      limit,
      lastSeen,
    );

    if (patients.length === 0) {
      throw new NoPatientsFoundForDoctorException(doctorId);
    }

    return patients;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListPatientsForDoctorController],
  providers: [ListPatientsForDoctorHandler],
})
export class ListPatientsForDoctorModule {}
