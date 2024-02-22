import { OmitType, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber()
  age: number;
}

export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, ['id'] as const),
) {}

export class AddPatientToDoctorDto extends PartialType(
  OmitType(CreatePatientDto, ['age'] as const),
) {}
