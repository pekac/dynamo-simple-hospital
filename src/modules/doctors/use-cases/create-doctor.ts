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

import { CreateDoctorDto } from '../doctor.dto';

import { DoctorAlreadyExistsException } from '../doctor.exceptions';

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
  constructor() {}

  async execute({ createDoctorDto }: CreateDoctorCommand) {
    try {
      // const doctor = await this.doctorsService.one(createDoctorDto.id);
      // if (doctor) {
      //   throw new DoctorAlreadyExistsException(createDoctorDto.id);
      // }
      // return this.doctorsService.create(createDoctorDto);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateDoctorController],
  providers: [CreateDoctorHandler],
})
export class CreateDoctorModule {}
