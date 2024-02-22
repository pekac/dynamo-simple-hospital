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

import { CreateDoctorDto, IDoctorsResource } from 'src/core';

import { DoctorAlreadyExistsException } from '../common';

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
    return this.doctors.addDoctor(createDoctorDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateDoctorController],
  providers: [CreateDoctorHandler],
})
export class CreateDoctorModule {}
