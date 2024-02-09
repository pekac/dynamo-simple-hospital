import { Module } from '@nestjs/common';

import { CreatePatientModule, GetPatientModule } from './use-cases';

@Module({
  imports: [CreatePatientModule, GetPatientModule],
})
export class PatientsModule {}
