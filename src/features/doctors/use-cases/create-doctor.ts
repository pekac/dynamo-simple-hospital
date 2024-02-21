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

import { IDoctorsResource } from 'src/core';

import { ItemKey } from 'src/dynamo';

import { CreateDoctorDto, DoctorAlreadyExistsException } from '../common';

class CreateDoctorCommand {
  constructor(public readonly createDoctorDto: CreateDoctorDto) {}
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
  constructor(private readonly doctors: IDoctorsResource) {}

  async execute({ createDoctorDto }: CreateDoctorCommand) {
    const doctor = await this.doctors.one(createDoctorDto.id);
    if (doctor) {
      throw new DoctorAlreadyExistsException(createDoctorDto.id);
    }
    return this.doctors.create({
      dto: createDoctorDto,
      decorator: decorateDoctor,
    });
  }
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

@Module({
  imports: [CqrsModule],
  controllers: [CreateDoctorController],
  providers: [CreateDoctorHandler],
})
export class CreateDoctorModule {}
