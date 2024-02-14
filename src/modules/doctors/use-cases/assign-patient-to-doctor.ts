import {
  Body,
  Controller,
  Module,
  Param,
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

import { DoctorsService } from '../doctors.service';
import { AssignPatientToDoctorDto } from '../doctor.dto';

class AssignPatientToDoctorCommand {
  constructor(
    public readonly doctorId: string,
    public readonly assignPatientDto: AssignPatientToDoctorDto,
  ) {}
}

@Controller()
class AssignPatientToDoctorController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('doctors/:id/patients')
  @UsePipes(new ValidationPipe())
  addPatientToDoctor(
    @Param('id') doctorId: string,
    @Body() assignPatientDto: AssignPatientToDoctorDto,
  ) {
    return this.commandBus.execute(
      new AssignPatientToDoctorCommand(doctorId, assignPatientDto),
    );
  }
}

@CommandHandler(AssignPatientToDoctorCommand)
class AssignPatientToDoctorHandler
  implements ICommandHandler<AssignPatientToDoctorCommand>
{
  constructor(private readonly doctorsService: DoctorsService) {}

  async execute({ doctorId, assignPatientDto }: AssignPatientToDoctorCommand) {
    return this.doctorsService.addPatient(doctorId, assignPatientDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [AssignPatientToDoctorController],
  providers: [AssignPatientToDoctorHandler],
})
export class AssignPatientToDoctorModule {}
