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

import { CreateSpecializationDto } from '../specialization.dto';

import { ISpecializationService } from '../specialization.interface';

import { SpecializationService } from '../specialization.service';

class CreateSpecializationCommand {
  constructor(public readonly specialization: string) {}
}

@Controller()
class CreateSpecializationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('specializations')
  @UsePipes(new ValidationPipe())
  createSpecialization(@Body() { specialization }: CreateSpecializationDto) {
    return this.commandBus.execute(
      new CreateSpecializationCommand(specialization),
    );
  }
}

@CommandHandler(CreateSpecializationCommand)
class CreateSpecializationHandler
  implements ICommandHandler<CreateSpecializationCommand>
{
  constructor(
    private readonly specializationsService: ISpecializationService,
  ) {}

  execute({ specialization }: CreateSpecializationCommand) {
    return this.specializationsService.addNewSpecialization(specialization);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateSpecializationController],
  providers: [
    CreateSpecializationHandler,
    { provide: ISpecializationService, useClass: SpecializationService },
  ],
})
export class CreateSpecializationModule {}
