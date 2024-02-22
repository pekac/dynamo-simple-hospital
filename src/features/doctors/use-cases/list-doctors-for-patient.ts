import { Controller, Get, Module, Param, Query } from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import {
  DOCTOR_ID_PREFIX,
  Doctor,
  ListDoctorsForPatientDto,
  PATIENT_ID_PREFIX,
} from 'src/core';

import { DATA_TABLE, client } from 'src/dynamo';

import { NoDoctorsFoundForPatientException } from '../common';

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
  ): Promise<Doctor[]> {
    const PK = `${PATIENT_ID_PREFIX}${patientId}`;
    const SK = lastSeen === '$' ? PK : `${DOCTOR_ID_PREFIX}${lastSeen}`;

    const command = new QueryCommand({
      TableName: DATA_TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: '#pk = :pk AND #sk < :sk',
      ExpressionAttributeNames: {
        '#pk': 'GSI3PK',
        '#sk': 'GSI3SK',
      },
      ExpressionAttributeValues: {
        ':pk': PK,
        ':sk': SK,
      },
      ScanIndexForward: false,
      Limit: limit,
    });

    const { Items = [] } = await client.send(command);

    return Items.map((d) => {
      const [firstName, lastName] = d.DoctorName.split(' ');
      return new Doctor(d.DoctorId, firstName, lastName, d.Specialization);
    });
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
