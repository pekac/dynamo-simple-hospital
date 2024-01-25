import { Module } from '@nestjs/common';

import { PatientsController } from '../controllers/';

import { IPatientsService, ITestsService } from '../interfaces/';

import { PatientsService, TestsService } from '../services/';

import { PatientsUseCases } from '../use-cases/';

@Module({
  controllers: [PatientsController],
  providers: [
    PatientsUseCases,
    { provide: IPatientsService, useClass: PatientsService },
    { provide: ITestsService, useClass: TestsService },
  ],
})
export class PatientsModule {}
