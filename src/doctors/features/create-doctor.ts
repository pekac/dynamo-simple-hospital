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

import { IDoctorsService } from '../doctor.interface';
import { DoctorsService } from '../doctors.service';
import { CreateDoctorDto } from '../doctor.dto';

class CreateDoctorCommand {
  constructor(public readonly createDoctorDto: CreateDoctorDto) {}
}

@Controller()
class CreateDoctorController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UsePipes(new ValidationPipe())
  createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return this.commandBus.execute(new CreateDoctorCommand(createDoctorDto));
  }
}

@CommandHandler(CreateDoctorCommand)
class CreateDoctorHandler implements ICommandHandler<CreateDoctorCommand> {
  constructor(private readonly doctorsService: IDoctorsService) {}

  // remove service?
  async execute({ createDoctorDto }: CreateDoctorCommand) {
    this.doctorsService.create(createDoctorDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateDoctorController],
  providers: [
    CreateDoctorHandler,
    { provide: IDoctorsService, useClass: DoctorsService },
  ],
})
export class CreateDoctorModule {}
