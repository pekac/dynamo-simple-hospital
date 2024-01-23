import { IsString, IsNumber, IsOptional } from 'class-validator';

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

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsNumber()
  @IsOptional()
  age: number;
}
