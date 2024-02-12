

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
