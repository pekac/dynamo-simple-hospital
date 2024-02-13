import { Controller, Delete, Module, Param } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { DoctorNotFoundException } from '../doctor.exceptions';

import { IDoctorsService } from '../doctor.interface';

import { DoctorsService } from '../doctors.service';

class DeleteDoctorCommand {
  constructor(public readonly doctorId: string) {}
}

@Controller()
class DeleteDoctorController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('doctors/:id')
  deleteDoctor(@Param('id') doctorId: string) {
    return this.commandBus.execute(new DeleteDoctorCommand(doctorId));
  }
}

@CommandHandler(DeleteDoctorCommand)
class DeleteDoctorHandler implements ICommandHandler<DeleteDoctorCommand> {
  constructor(private readonly doctorsService: IDoctorsService) {}

  async execute({ doctorId }: DeleteDoctorCommand) {
    try {
      const doctor = await this.doctorsService.one(doctorId);

      if (!doctor) {
        throw new DoctorNotFoundException(doctorId);
      }

      return this.doctorsService.remove(doctorId);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [DeleteDoctorController],
  providers: [
    DeleteDoctorHandler,
    { provide: IDoctorsService, useClass: DoctorsService },
  ],
})
export class DeleteDoctorModule {}
