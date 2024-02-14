import { OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  specialization: string;
}

export class UpdateDoctorDto extends PartialType(
  OmitType(CreateDoctorDto, ['id'] as const),
) {}

export class ListDoctorsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  readonly filterBy?: string[];

  @IsOptional()
  @IsString()
  readonly lastSeen?: string;

  @IsOptional()
  @IsString()
  readonly collection?: string;

  @IsOptional()
  @IsInt()
  readonly limit?: number;
}

export class ListDoctorsForPatientDto {
  @IsOptional()
  @IsString()
  readonly lastSeen?: string;

  @IsOptional()
  @IsInt()
  readonly limit?: number;
}

export class AssignPatientToDoctorDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
