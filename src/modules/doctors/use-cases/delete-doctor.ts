import { Controller, Delete, Module, Param } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import {
  ITEM_BASED_ACTIONS,
  itemBasedActionGenerator,
} from 'src/dynamo/resource-fn';

import { DOCTOR_ID_PREFIX, Doctor } from 'src/core';

import { DoctorNotFoundException } from '../doctor.exceptions';

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
  private readonly getDoctorById: (doctorId: string) => Promise<Doctor> =
    itemBasedActionGenerator(
      Doctor,
      DOCTOR_ID_PREFIX,
      DOCTOR_ID_PREFIX,
      ITEM_BASED_ACTIONS.GET,
    );
  private readonly deleteDoctorById: (doctorId: string) => Promise<Doctor> =
    itemBasedActionGenerator(
      Doctor,
      DOCTOR_ID_PREFIX,
      DOCTOR_ID_PREFIX,
      ITEM_BASED_ACTIONS.DELETE,
    );

  async execute({ doctorId }: DeleteDoctorCommand) {
    const doctor = await this.getDoctorById(doctorId);
    if (!doctor) {
      throw new DoctorNotFoundException(doctorId);
    }
    return this.deleteDoctorById(doctorId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [DeleteDoctorController],
  providers: [DeleteDoctorHandler],
})
export class DeleteDoctorModule {}
