import { Module } from '@nestjs/common';

import { DoctorsController } from '../controllers';

import { IDoctorsService, ISpecializationService } from '../interfaces';

import { DoctorsService, SpecializationService } from '../services';

import { DoctorsUseCases } from '../use-cases';

@Module({
  controllers: [DoctorsController],
  providers: [
    DoctorsUseCases,
    { provide: IDoctorsService, useClass: DoctorsService },
    { provide: ISpecializationService, useClass: SpecializationService },
  ],
})
export class DoctorsModule {}
