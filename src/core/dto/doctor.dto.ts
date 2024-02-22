import { OmitType, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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

export class AssignPatientToDoctorDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

export class CreateSpecializationDto {
  @IsString()
  specialization: string;
}
