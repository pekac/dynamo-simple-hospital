import { OmitType, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

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

type sortBy = 'lastName' | 'createdAt';

export class ListPatientsDto {
  @IsString()
  readonly sortBy: sortBy;

  @IsString()
  readonly lastSeen: string;

  @IsInt()
  readonly limit: number;
}

export class ListPatientsForDoctorDto {
  @IsOptional()
  @IsString()
  readonly lastSeen?: string;

  @IsOptional()
  @IsString()
  readonly limit?: number;
}
