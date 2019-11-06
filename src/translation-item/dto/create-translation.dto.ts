import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTranslationDTO {
  @IsNotEmpty()
  sourceText: string;

  @IsNotEmpty()
  assetId: string;

  @IsOptional()
  context: string;

  @IsOptional()
  labels: string;

  @IsOptional()
  notes: string;

  @IsOptional()
  status: string;

  @IsNotEmpty()
  language: string;
}
