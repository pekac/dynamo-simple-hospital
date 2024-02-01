import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
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

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  specialization: string;
}

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

export class CreateSpecializationDto {
  @IsString()
  specialization: string;
}
