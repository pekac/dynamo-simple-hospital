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
const KSUID = require('ksuid');

import { DOCTOR_ID_PREFIX, TEST_SK_PREFIX, TestsResource } from 'src/core';

import { ItemKey } from 'src/dynamo';

import { CreateTestDto } from '../common';

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
  constructor(private readonly tests: TestsResource) {}

  async execute({
    patientId,
    createTestDto,
  }: CreateTestForPatientCommand): Promise<string | undefined> {
    return this.tests.create({
      dto: createTestDto,
      parentId: patientId,
      decorator: decorateTest,
    });
  }
}

function decorateTest(test: CreateTestDto & ItemKey & { createdAt: Date }) {
  const ksuid = KSUID.randomSync(test.createdAt).string;
  /* override SK */
  test.SK = `${TEST_SK_PREFIX}${ksuid}`;
  return {
    ...test,
    /* for fetching by doctor id */
    GSI1PK: `${DOCTOR_ID_PREFIX}${test.doctorId}`,
    GSI1SK: test.SK,
  };
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateTestForPatientController],
  providers: [CreateTestForPatientHandler, TestsResource],
})
export class CreateTestForPatientModule {}
