import { Module } from '@nestjs/common';

import { DoctorsModule } from './doctors/doctors.module';
import { SpecializationsModule } from './specializations/specializations.module';

@Module({
  imports: [DoctorsModule, SpecializationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
