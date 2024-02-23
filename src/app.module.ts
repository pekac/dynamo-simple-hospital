import { Module } from '@nestjs/common';

import { DynamoModule } from './dynamo';

import { DoctorsModule, PatientsModule, TestsModule } from './features';

@Module({
  imports: [DoctorsModule, DynamoModule, PatientsModule, TestsModule],
})
export class AppModule {}
