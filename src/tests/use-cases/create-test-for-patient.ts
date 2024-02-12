import {
  Body,
  Controller,
  Module,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTestDto } from '../test.dto';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';
import { ITestsService } from '../test.interface';
import { TestsService } from '../tests.service';

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
  constructor(private readonly testsService: ITestsService) {}

  async execute({ patientId, createTestDto }: CreateTestForPatientCommand) {
    return this.testsService.create(createTestDto, patientId);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateTestForPatientController],
  providers: [
    CreateTestForPatientHandler,
    { provide: ITestsService, useClass: TestsService },
  ],
})
export class CreateTestForPatientModule {}
