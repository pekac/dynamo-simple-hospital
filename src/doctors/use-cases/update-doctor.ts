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

import { IDoctorsService } from '../doctor.interface';
import { DoctorsService } from '../doctors.service';
import { UpdateDoctorDto } from '../doctor.dto';

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
  constructor(private readonly doctorsService: IDoctorsService) {}

  async execute({ doctorId, updateDoctorDto }: UpdateDoctorCommand) {
    return this.doctorsService.update(doctorId, updateDoctorDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [UpdateDoctorController],
  providers: [
    UpdateDoctorHandler,
    { provide: IDoctorsService, useClass: DoctorsService },
  ],
})
export class UpdateDoctorModule {}
