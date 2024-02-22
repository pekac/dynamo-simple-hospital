import { IsString, IsOptional, IsInt } from 'class-validator';

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
