import { Module } from '@nestjs/common';

import { DoctorsController } from '../controllers';

import { IDoctorsService } from '../interfaces';

import { DoctorsService } from '../services';

import { DoctorsUseCases } from '../use-cases';

@Module({
  controllers: [DoctorsController],
  providers: [
    DoctorsUseCases,
    { provide: IDoctorsService, useClass: DoctorsService },
  ],
})
export class DoctorsModule {}
