export class TestsUseCases {
  getTestForPatient(patientId: string, testId: string) {
    return this.testsService.one(patientId, testId);
  }

  deleteTest(patientId: string, testId: string) {
    return this.testsService.remove(patientId, testId);
  }
}
