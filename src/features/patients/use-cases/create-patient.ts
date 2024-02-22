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

import { CreatePatientDto, IPatientsResource } from 'src/core';

import { PatientAlreadyExistsException } from '../common';

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
  constructor(private readonly patients: IPatientsResource) {}

  async execute({ createPatientDto }: CreatePatientCommand) {
    const patient = await this.patients.one(createPatientDto.id);
    if (patient) {
      throw new PatientAlreadyExistsException(createPatientDto.id);
    }

    return this.patients.addPatient(createPatientDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreatePatientController],
  providers: [CreatePatientHandler],
})
export class CreatePatientModule {}
