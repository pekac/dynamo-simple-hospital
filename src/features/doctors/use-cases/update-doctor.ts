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

import { IDoctorsResource, UpdateDoctorDto } from 'src/core';

import { DoctorNotFoundException } from '../common';

class UpdateDoctorCommand {
  constructor(
    public readonly doctorId: string,
    public readonly updateDoctorDto: UpdateDoctorDto,
  ) {}
}

@Controller()
class UpdateDoctorController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('doctors/:id')
  @UsePipes(new ValidationPipe())
  updateDoctor(
    @Param('id') doctorId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.commandBus.execute(
      new UpdateDoctorCommand(doctorId, updateDoctorDto),
    );
  }
}

@CommandHandler(UpdateDoctorCommand)
class UpdateDoctorHandler implements ICommandHandler<UpdateDoctorCommand> {
  constructor(private readonly doctors: IDoctorsResource) {}

  async execute({ doctorId, updateDoctorDto }: UpdateDoctorCommand) {
    const doctor = await this.doctors.one(doctorId);
    if (!doctor) {
      throw new DoctorNotFoundException(doctorId);
    }
    return this.doctors.update(doctorId, updateDoctorDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [UpdateDoctorController],
  providers: [UpdateDoctorHandler],
})
export class UpdateDoctorModule {}
