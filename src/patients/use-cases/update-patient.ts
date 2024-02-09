import {
  Body,
  Controller,
  Module,
  Param,
  Put,
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
import { UpdatePatientDto } from '../patient.dto';

class UpdatePatientCommand {
  constructor(
    public readonly patientId: string,
    public readonly updatePatientDto: UpdatePatientDto,
  ) {}
}

@Controller()
class UpdatePatientController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('patients/:id')
  @UsePipes(new ValidationPipe())
  updatePatient(
    @Param('id') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.commandBus.execute(
      new UpdatePatientCommand(patientId, updatePatientDto),
    );
  }
}

@CommandHandler(UpdatePatientCommand)
class UpdatePatientHandler implements ICommandHandler<UpdatePatientCommand> {
  constructor(private readonly patientsService: IPatientsService) {}

  async execute({ patientId, updatePatientDto }: UpdatePatientCommand) {
    return this.patientsService.update(patientId, updatePatientDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [UpdatePatientController],
  providers: [
    UpdatePatientHandler,
    { provide: IPatientsService, useClass: PatientsService },
  ],
})
export class UpdatePatientModule {}
