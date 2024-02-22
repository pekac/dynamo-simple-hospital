import { IsString, IsInt } from 'class-validator';

export class ListTestsParamsDto {
  @IsString()
  readonly lastSeen: string;

  @IsInt()
  readonly limit: number;
}
