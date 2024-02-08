import { Module } from '@nestjs/common';
import {
  CreateSpecializationModule,
  GetSpecializationsModule,
} from './use-cases';

@Module({
  imports: [CreateSpecializationModule, GetSpecializationsModule],
})
export class SpecializationsModule {}
