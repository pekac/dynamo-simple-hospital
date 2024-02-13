import { Controller, Delete, Module, Param } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { IDoctorsService } from '../doctor.interface';
import { DoctorsService } from '../doctors.service';

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
  constructor(private readonly doctorsService: IDoctorsService) {}

  async execute({ doctorId, patientId }: RemovePatientFromDoctorCommand) {
    return this.doctorsService.removePatientFromDoctor(doctorId, patientId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [RemovePatientFromDoctorController],
  providers: [
    RemovePatientFromDoctorHandler,
    { provide: IDoctorsService, useClass: DoctorsService },
  ],
})
export class RemovePatientFromDoctorModule {}
