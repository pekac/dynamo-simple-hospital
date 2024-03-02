import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DynamoModule } from './dynamo';

import { DoctorsModule, PatientsModule, TestsModule } from './features';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DoctorsModule,
    DynamoModule,
    PatientsModule,
    TestsModule,
  ],
})
export class AppModule {}
