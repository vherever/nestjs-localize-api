import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTranslationDTO {
  @IsNotEmpty()
  sourceText: string;

  @IsNotEmpty()
  assetCode: string;

  @IsOptional()
  context: string;

  @IsOptional()
  labels: string;

  @IsOptional()
  notes: string;

  @IsOptional()
  status: string;

  @IsOptional()
  language: string;

  @IsOptional()
  defaultLanguage: string;
}
