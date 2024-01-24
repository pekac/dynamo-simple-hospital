import { Module } from '@nestjs/common';
/* ctrl */
import { PatientsController } from '../controllers/patients.controller';
/* interfaces */
import { IPatientsService } from '../interfaces/patient.interface';
/* services */
import { PatientsService } from '../services/patients.service';
/* use cases */
import { PatientsUseCases } from '../use-cases/patients.use-cases';

@Module({
  controllers: [PatientsController],
  providers: [
    PatientsUseCases,
    { provide: IPatientsService, useClass: PatientsService },
  ],
})
export class PatientsModule {}
