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

type sortBy = 'lastName' | 'createdAt';

export class ListPatientsDto {
  @IsString()
  readonly sortBy: sortBy;

  @IsString()
  readonly lastSeen: string;

  @IsInt()
  readonly limit: number;
}
