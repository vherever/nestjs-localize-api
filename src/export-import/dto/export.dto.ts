import { IsOptional } from 'class-validator';

export class ExportDTO {
  @IsOptional()
  t: string; // type (json | php)

  @IsOptional()
  l: string; // languages
}
