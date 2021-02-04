import { IsNotEmpty } from 'class-validator';

export class ExportDTO {
  @IsNotEmpty()
  f: string; // file format (json | php)

  @IsNotEmpty()
  t: string; // asset type

  @IsNotEmpty()
  l: string; // languages
}
