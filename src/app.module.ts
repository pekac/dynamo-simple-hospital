import { Module } from '@nestjs/common';
import { PatientsModule } from './modules/patients.module';

@Module({
  imports: [PatientsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
