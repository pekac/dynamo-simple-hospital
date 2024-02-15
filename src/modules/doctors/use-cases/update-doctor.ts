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

import { UpdateDoctorDto } from '../doctor.dto';

import { DoctorNotFoundException } from '../doctor.exceptions';

import { DoctorsService } from '../doctors.service';

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
  constructor() {}

  async execute({ doctorId, updateDoctorDto }: UpdateDoctorCommand) {
    try {
      // const doctor = await this.doctorsService.one(doctorId);
      // if (!doctor) {
      //   throw new DoctorNotFoundException(doctorId);
      // }
      // return this.doctorsService.update(doctorId, updateDoctorDto);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [UpdateDoctorController],
  providers: [UpdateDoctorHandler],
})
export class UpdateDoctorModule {}
