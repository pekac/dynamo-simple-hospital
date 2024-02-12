import { IsString, IsInt } from 'class-validator';

export class CreateTestDto {
  @IsString()
  code: string;

  @IsString()
  type: string;

  @IsString()
  doctorId: string;
}

export class ListTestsParamsDto {
  @IsString()
  readonly lastSeen: string;

  @IsInt()
  readonly limit: number;
}
