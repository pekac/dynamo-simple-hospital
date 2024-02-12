import { Controller } from '@nestjs/common';
import { TestsUseCases } from './tests.use-cases';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsUseCases: TestsUseCases);

  /* tests */
  @Get(':patientId/tests')
  getTestsForPatient(
    @Param('patientId') patientId: string,
    @Query() { lastSeen, limit }: ListPatientTestsDto,
  ) {
    return this.testsUseCases.getTestsForPatient(patientId, lastSeen, limit);
  }

  @Post(':patientId/tests')
  @UsePipes(new ValidationPipe())
  createTestForPatient(
    @Param('patientId') patientId: string,
    @Body() createTestDto: CreateTestDto,
  ) {
    return this.testsUseCases.createTestForPatient(patientId, createTestDto);
  }

  @Get(':patientId/tests/:testId')
  getTestForPatient(
    @Param('patientId') patientId: string,
    @Param('testId') testId: string,
  ) {
    return this.testsUseCases.getTestForPatient(patientId, testId);
  }

  @Delete(':patientId/tests/:testId')
  deleteTest(
    @Param('patientId') patientId: string,
    @Param('testId') testId: string,
  ) {
    return this.testsUseCases.deleteTest(patientId, testId);
  }
}
