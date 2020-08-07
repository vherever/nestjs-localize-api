import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { LanguageValidatorString } from '../../shared/validators/language-validator-string';

export class UpdateProjectDTO {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @Validate(LanguageValidatorString, {message: 'Unsupported locale key in defaultLocale'})
  defaultLocale: string;

  @IsOptional()
  @Validate(LanguageValidatorString, {message: 'Unsupported locale key in translationsLocales'})
  translationsLocales: string;
}
