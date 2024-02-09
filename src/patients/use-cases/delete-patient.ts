import { Controller, Delete, Module, Param } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { IPatientsService } from '../patient.interface';
import { PatientsService } from '../patients.service';

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
  constructor(private readonly patientsService: IPatientsService) {}

  async execute({ patientId }: DeletePatientCommand) {
    return this.patientsService.remove(patientId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [DeletePatientController],
  providers: [
    DeletePatientHandler,
    { provide: IPatientsService, useClass: PatientsService },
  ],
})
export class DeletePatientModule {}
