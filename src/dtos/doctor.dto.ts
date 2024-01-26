import { IsOptional, IsString } from 'class-validator';

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
