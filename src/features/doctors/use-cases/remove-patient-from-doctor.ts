import { Controller, Delete, Module, Param } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { IDoctorPatientsResource } from 'src/core';

class RemovePatientFromDoctorCommand {
  constructor(
    public readonly doctorId: string,
    public readonly patientId: string,
  ) {}
}

@Controller()
class RemovePatientFromDoctorController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete(':doctorId/patients/:patientId')
  removePatientFromDoctor(
    @Param('doctorId') doctorId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.commandBus.execute(
      new RemovePatientFromDoctorCommand(doctorId, patientId),
    );
  }
}

@CommandHandler(RemovePatientFromDoctorCommand)
class RemovePatientFromDoctorHandler
  implements ICommandHandler<RemovePatientFromDoctorCommand>
{
  constructor(private readonly doctorPatients: IDoctorPatientsResource) {}

  async execute({ doctorId, patientId }: RemovePatientFromDoctorCommand) {
    return this.doctorPatients.removePatientFromDoctor(doctorId, patientId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [RemovePatientFromDoctorController],
  providers: [RemovePatientFromDoctorHandler],
})
export class RemovePatientFromDoctorModule {}
