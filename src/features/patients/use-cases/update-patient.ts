import {
  Body,
  Controller,
  Module,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { UpdatePatientDto, IPatientsResource } from 'src/core';

import { PatientNotFoundException } from '../common';

class UpdatePatientCommand {
  constructor(
    public readonly patientId: string,
    public readonly updatePatientDto: UpdatePatientDto,
  ) {}
}

@Controller()
class UpdatePatientController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('patients/:id')
  @UsePipes(new ValidationPipe())
  updatePatient(
    @Param('id') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.commandBus.execute(
      new UpdatePatientCommand(patientId, updatePatientDto),
    );
  }
}

@CommandHandler(UpdatePatientCommand)
class UpdatePatientHandler implements ICommandHandler<UpdatePatientCommand> {
  constructor(private readonly patients: IPatientsResource) {}

  async execute({ patientId, updatePatientDto }: UpdatePatientCommand) {
    const patient = await this.patients.one(patientId);
    if (!patient) {
      throw new PatientNotFoundException(patientId);
    }

    return this.patients.update(patientId, updatePatientDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [UpdatePatientController],
  providers: [UpdatePatientHandler],
})
export class UpdatePatientModule {}
