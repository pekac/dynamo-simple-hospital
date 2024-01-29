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

export class GetDoctorDto extends CreateDoctorDto {}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  specialization: string;
}

export class LastSeenDoctorDto {
  @IsString()
  readonly id: string;

  @IsString()
  readonly collection: string;
}

export class ListDoctorsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  readonly filterBy?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LastSeenDoctorDto)
  readonly lastSeen?: LastSeenDoctorDto;

  @IsOptional()
  @IsInt()
  readonly limit?: number;
}
