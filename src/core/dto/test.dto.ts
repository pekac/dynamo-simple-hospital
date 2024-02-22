import { IsString } from 'class-validator';

export class CreateTestDto {
  @IsString()
  code: string;

  @IsString()
  type: string;

  @IsString()
  doctorId: string;
}
