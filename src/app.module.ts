import { Module } from '@nestjs/common';

import { DoctorsModule, PatientsModule } from './modules/';

@Module({
  imports: [DoctorsModule, PatientsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
