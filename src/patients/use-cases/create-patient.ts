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

import { IPatientsService } from '../patient.interface';
import { PatientsService } from '../patients.service';
import { CreatePatientDto } from '../patient.dto';

class CreatePatientCommand {
  constructor(public readonly createPatientDto: CreatePatientDto) {}
}

@Controller()
class CreatePatientController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('patients')
  @UsePipes(new ValidationPipe())
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.commandBus.execute(new CreatePatientCommand(createPatientDto));
  }
}

@CommandHandler(CreatePatientCommand)
class CreatePatientHandler implements ICommandHandler<CreatePatientCommand> {
  constructor(private readonly patientsService: IPatientsService) {}

  async execute({ createPatientDto }: CreatePatientCommand) {
    return this.patientsService.create(createPatientDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreatePatientController],
  providers: [
    CreatePatientHandler,
    { provide: IPatientsService, useClass: PatientsService },
  ],
})
export class CreatePatientModule {}
