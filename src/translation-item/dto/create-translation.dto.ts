import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { LanguageValidatorObject } from '../../shared/validators/language-validator-object';

export class CreateTranslationDTO {
  @IsNotEmpty()
  @Validate(LanguageValidatorObject, {message: 'Unsupported translation locale key'})
  translations: string;

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
}
