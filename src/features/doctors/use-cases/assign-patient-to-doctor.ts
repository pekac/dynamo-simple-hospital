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

import {
  AssignPatientToDoctorDto,
  IDoctorPatientsResource,
  IDoctorsResource,
} from 'src/core';

import {
  DoctorNotFoundException,
  PatientAlreadyExistsException,
} from '../common';

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
  constructor(
    private readonly doctors: IDoctorsResource,
    private readonly doctorPatients: IDoctorPatientsResource,
  ) {}

  async execute({ doctorId, assignPatientDto }: AssignPatientToDoctorCommand) {
    const doctor = await this.doctors.one(doctorId);
    if (!doctor) {
      throw new DoctorNotFoundException(doctorId);
    }

    const doctorPatient = await this.doctorPatients.one(
      doctorId,
      assignPatientDto.id,
    );
    if (doctorPatient) {
      throw new PatientAlreadyExistsException(doctorId, assignPatientDto.id);
    }

    return this.doctorPatients.addPatient(doctor, assignPatientDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [AssignPatientToDoctorController],
  providers: [AssignPatientToDoctorHandler],
})
export class AssignPatientToDoctorModule {}
