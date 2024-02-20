import { Module } from '@nestjs/common';

import { DoctorsModule, PatientsModule, TestsModule } from './features';

@Module({
  imports: [DoctorsModule, PatientsModule, TestsModule],
})
export class AppModule {}
