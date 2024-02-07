import { Module } from '@nestjs/common';

import { DoctorsController } from './doctors.controller';

import { IDoctorsService } from './doctor.interface';

import { DoctorsService } from './doctors.service';

import { DoctorsUseCases } from './doctors.use-cases';

import {
  ISpecializationService,
  SpecializationService,
} from '../specialization';

@Module({
  controllers: [DoctorsController],
  providers: [
    DoctorsUseCases,
    { provide: IDoctorsService, useClass: DoctorsService },
    { provide: ISpecializationService, useClass: SpecializationService },
  ],
})
export class DoctorsModule {}
