import { Module } from '@nestjs/common';

import { PatientsModule } from './modules/';

@Module({
  imports: [PatientsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
