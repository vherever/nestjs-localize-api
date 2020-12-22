import { IsOptional } from 'class-validator';

export class ExportDTO {
  @IsOptional()
  type: string;

  @IsOptional()
  lang: string;
}
