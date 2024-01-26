import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateTestDto {
  @IsString()
  code: string;

  @IsString()
  type: string;

  @IsString()
  doctorId: string;
}

export class GetTestDto extends CreateTestDto {
  @IsString()
  id: string;
}

export class ListPatientTestsDto {
  @IsString()
  readonly lastSeen: string;

  @IsInt()
  readonly limit: number;
}
