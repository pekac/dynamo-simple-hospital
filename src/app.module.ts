import { Module } from '@nestjs/common';

import { DoctorsModule, PatientsModule, TestsModule } from './modules';

@Module({
  imports: [DoctorsModule, PatientsModule, TestsModule],
})
export class AppModule {}
