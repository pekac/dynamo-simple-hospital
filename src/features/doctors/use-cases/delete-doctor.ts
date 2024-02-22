import { Controller, Delete, Module, Param } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { IDoctorsResource } from 'src/core';

import { DoctorNotFoundException } from '../common';

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
  constructor(private readonly doctors: IDoctorsResource) {}

  async execute({ doctorId }: DeleteDoctorCommand) {
    const doctor = await this.doctors.one(doctorId);
    if (!doctor) {
      throw new DoctorNotFoundException(doctorId);
    }
    return this.doctors.remove(doctorId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [DeleteDoctorController],
  providers: [DeleteDoctorHandler],
})
export class DeleteDoctorModule {}
