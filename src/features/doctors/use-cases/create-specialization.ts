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

import { CreateSpecializationDto, ISpecializationResource } from 'src/core';

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
  constructor(private readonly specializations: ISpecializationResource) {}

  async execute({ specialization }: CreateSpecializationCommand) {
    return this.specializations.create(specialization);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateSpecializationController],
  providers: [CreateSpecializationHandler],
})
export class CreateSpecializationModule {}
