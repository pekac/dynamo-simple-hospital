import { Controller, Delete, Module, Param } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import {
  ITEM_BASED_ACTIONS,
  itemActionGenerator,
} from 'src/dynamo/resource-fn';

import { DOCTOR_ID_PREFIX, Doctor } from 'src/core';

import { DoctorNotFoundException } from '../doctor.exceptions';

interface IDoctorActions {
  one: (doctorId: string) => Promise<Doctor | undefined>;
  remove: (doctorId: string) => Promise<Doctor | undefined>;
}

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
  private readonly itemActions = itemActionGenerator({
    entityTemplate: Doctor,
    actions: [ITEM_BASED_ACTIONS.GET, ITEM_BASED_ACTIONS.DELETE],
    pkPrefix: DOCTOR_ID_PREFIX,
  }) as unknown as IDoctorActions;

  async execute({ doctorId }: DeleteDoctorCommand) {
    const doctor = await this.itemActions.one(doctorId);
    if (!doctor) {
      throw new DoctorNotFoundException(doctorId);
    }
    return this.itemActions.remove(doctorId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [DeleteDoctorController],
  providers: [DeleteDoctorHandler],
})
export class DeleteDoctorModule {}
