import {
  Body,
  Controller,
  Module,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { PATIENT_ID_PREFIX, PatientsResource } from 'src/core';

import { ItemKey } from 'src/dynamo';

import { capitalize, truncateDateToWeek } from 'src/utils';

import { CreatePatientDto, PatientAlreadyExistsException } from '../common';

class CreatePatientCommand {
  constructor(public readonly createPatientDto: CreatePatientDto) {}
}

@Controller()
class CreatePatientController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('patients')
  @UsePipes(new ValidationPipe())
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.commandBus.execute(new CreatePatientCommand(createPatientDto));
  }
}

@CommandHandler(CreatePatientCommand)
class CreatePatientHandler implements ICommandHandler<CreatePatientCommand> {
  constructor(private readonly patients: PatientsResource) {}

  async execute({ createPatientDto }: CreatePatientCommand) {
    const patient = await this.patients.one(createPatientDto.id);
    if (patient) {
      throw new PatientAlreadyExistsException(createPatientDto.id);
    }

    return this.patients.create({
      dto: createPatientDto,
      decorator: decoratePatient,
    });
  }
}

function decoratePatient(
  patient: CreatePatientDto & ItemKey & { createdAt: Date },
) {
  const firstLetter = patient.lastName.charAt(0);
  return {
    ...patient,
    CreatedAt: patient.createdAt.toISOString(),
    /* list by last name */
    GSI1PK: `${PATIENT_ID_PREFIX}${capitalize(firstLetter)}`,
    GSI1SK: `${PATIENT_ID_PREFIX}${patient.lastName.toUpperCase()}`,
    /* list by created at */
    GSI2PK: `${PATIENT_ID_PREFIX}${truncateDateToWeek(patient.createdAt).toISOString()}`,
    GSI2SK: `${PATIENT_ID_PREFIX}${patient.createdAt.toISOString()}`,
    /* for listing doctors */
    GSI3PK: patient.PK,
    GSI3SK: patient.SK,
  };
}

@Module({
  imports: [CqrsModule],
  controllers: [CreatePatientController],
  providers: [CreatePatientHandler, PatientsResource],
})
export class CreatePatientModule {}
