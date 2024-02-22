import { Controller, Delete, Module, Param } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { IPatientsResource } from 'src/core';

import { PatientNotFoundException } from '../common';

class DeletePatientCommand {
  constructor(public readonly patientId: string) {}
}

@Controller()
class DeletePatientController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('patients/:id')
  deletePatient(@Param('id') patientId: string) {
    return this.commandBus.execute(new DeletePatientCommand(patientId));
  }
}

@CommandHandler(DeletePatientCommand)
class DeletePatientHandler implements ICommandHandler<DeletePatientCommand> {
  constructor(private readonly patients: IPatientsResource) {}

  async execute({ patientId }: DeletePatientCommand) {
    const patient = await this.patients.one(patientId);
    if (!patient) {
      throw new PatientNotFoundException(patientId);
    }

    return this.patients.remove(patientId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [DeletePatientController],
  providers: [DeletePatientHandler],
})
export class DeletePatientModule {}
