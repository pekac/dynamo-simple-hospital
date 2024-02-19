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

import { Doctor, DoctorPatientsResource, DoctorsResource } from 'src/core';

import { ItemKey } from 'src/dynamo';

import {
  AssignPatientToDoctorDto,
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
    private readonly doctors: DoctorsResource,
    private readonly doctorPatients: DoctorPatientsResource,
  ) {}

  async execute({ doctorId, assignPatientDto }: AssignPatientToDoctorCommand) {
    /* all of this in a tx */
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

    const decorator = generateDecorator(doctor);

    return this.doctorPatients.create({
      dto: assignPatientDto,
      parentId: doctorId,
      decorator,
    });
  }
}

function generateDecorator(doctor: Doctor & ItemKey) {
  return function transformDoctorPatient(
    addPatientDto: AssignPatientToDoctorDto & ItemKey,
  ) {
    return {
      PatientName: `${addPatientDto.firstName} ${addPatientDto.lastName}`,
      PatientId: addPatientDto.id,
      DoctorName: `${doctor?.firstName} ${doctor?.lastName}`,
      Specialization: doctor?.specialization,
      DoctorId: doctor.id,
      PK: doctor.PK,
      SK: addPatientDto.PK,
      GSI3PK: addPatientDto.PK,
      GSI3SK: doctor.PK,
    };
  };
}

@Module({
  imports: [CqrsModule],
  controllers: [AssignPatientToDoctorController],
  providers: [
    AssignPatientToDoctorHandler,
    DoctorsResource,
    DoctorPatientsResource,
  ],
})
export class AssignPatientToDoctorModule {}
