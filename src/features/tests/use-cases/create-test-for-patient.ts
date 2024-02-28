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

import { CreateTestDto, ITestsResource } from 'src/core';

class CreateTestForPatientCommand {
  constructor(
    public readonly patientId: string,
    public readonly createTestDto: CreateTestDto,
  ) {}
}

@Controller()
class CreateTestForPatientController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('patients/:patientId/tests')
  @UsePipes(new ValidationPipe())
  createTestForPatient(
    @Param('patientId') patientId: string,
    @Body() createTestDto: CreateTestDto,
  ) {
    return this.commandBus.execute(
      new CreateTestForPatientCommand(patientId, createTestDto),
    );
  }
}

@CommandHandler(CreateTestForPatientCommand)
class CreateTestForPatientHandler
  implements ICommandHandler<CreateTestForPatientCommand>
{
  constructor(private readonly tests: ITestsResource) {}

  async execute({
    patientId,
    createTestDto,
  }: CreateTestForPatientCommand): Promise<string | undefined> {
    return this.tests.addTest(patientId, createTestDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateTestForPatientController],
  providers: [CreateTestForPatientHandler],
})
export class CreateTestForPatientModule {}
