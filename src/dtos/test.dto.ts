import { IsString, IsOptional } from 'class-validator';

export class CreateTestDto {
  @IsString()
  code: string;

  @IsString()
  type: string;
}

export class GetTestDto extends CreateTestDto {
  @IsString()
  id: string;
}

export class UpdateTestDto {
  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  type: string;
}
