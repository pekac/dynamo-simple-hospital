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

import { ITEM_BASED_ACTIONS, ItemKey, itemActionGenerator } from 'src/dynamo';

import { CreateDoctorDto } from '../doctor.dto';

import { DoctorAlreadyExistsException } from '../doctor.exceptions';
import { DOCTOR_ID_PREFIX, Doctor } from 'src/core';

interface IDoctorActions {
  create(
    createDto: Partial<Doctor>,
    parentId?: string,
  ): Promise<string | undefined>;
  one: (doctorId: string) => Promise<Doctor | undefined>;
}

class CreateDoctorCommand {
  constructor(public readonly createDoctorDto: CreateDoctorDto) {}
}

function decorateDoctor(doctor: CreateDoctorDto & ItemKey) {
  const specialization = doctor.specialization.toUpperCase();
  return {
    ...doctor,
    /* for fetching tests */
    GSI1PK: doctor.PK,
    GSI1SK: doctor.SK,
    /* for listing by specialization */
    specialization,
    GSI2PK: `SPECIALIZATION#${specialization}`,
    GSI2SK: `${specialization}#${doctor.id}`,
    /* for listing patients */
    GSI3PK: doctor.PK,
    GSI3SK: doctor.SK,
  };
}

@Controller()
class CreateDoctorController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('doctors')
  @UsePipes(new ValidationPipe())
  createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return this.commandBus.execute(new CreateDoctorCommand(createDoctorDto));
  }
}

@CommandHandler(CreateDoctorCommand)
class CreateDoctorHandler implements ICommandHandler<CreateDoctorCommand> {
  private readonly itemActions = itemActionGenerator({
    entityTemplate: Doctor,
    actions: [ITEM_BASED_ACTIONS.CREATE, ITEM_BASED_ACTIONS.GET],
    pkPrefix: DOCTOR_ID_PREFIX,
    decorate: decorateDoctor,
  }) as IDoctorActions;

  async execute({ createDoctorDto }: CreateDoctorCommand) {
    const doctor = await this.itemActions.one(createDoctorDto.id);
    if (doctor) {
      throw new DoctorAlreadyExistsException(createDoctorDto.id);
    }
    return this.itemActions.create(createDoctorDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateDoctorController],
  providers: [CreateDoctorHandler],
})
export class CreateDoctorModule {}
