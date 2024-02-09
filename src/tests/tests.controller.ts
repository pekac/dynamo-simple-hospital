import { Controller } from '@nestjs/common';

@Controller('tests')
export class TestsController {
  constructor();

  /* tests */
  @Get(':patientId/tests')
  getTestsForPatient(
    @Param('patientId') patientId: string,
    @Query() { lastSeen, limit }: ListPatientTestsDto,
  ) {
    return this.patientsUseCase.getTestsForPatient(patientId, lastSeen, limit);
  }

  @Post(':patientId/tests')
  @UsePipes(new ValidationPipe())
  createTestForPatient(
    @Param('patientId') patientId: string,
    @Body() createTestDto: CreateTestDto,
  ) {
    return this.patientsUseCase.createTestForPatient(patientId, createTestDto);
  }

  @Get(':patientId/tests/:testId')
  getTestForPatient(
    @Param('patientId') patientId: string,
    @Param('testId') testId: string,
  ) {
    return this.patientsUseCase.getTestForPatient(patientId, testId);
  }

  @Delete(':patientId/tests/:testId')
  deleteTest(
    @Param('patientId') patientId: string,
    @Param('testId') testId: string,
  ) {
    return this.patientsUseCase.deleteTest(patientId, testId);
  }
}
