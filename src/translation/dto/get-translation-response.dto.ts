import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetTranslationResponseDTO {
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
}
