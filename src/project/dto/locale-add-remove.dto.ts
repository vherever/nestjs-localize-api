import { IsOptional, Validate } from 'class-validator';
import { LanguageValidatorString } from '../../shared/validators/language-validator-string';

export class LocaleToAddRemoveDTO {
  @IsOptional()
  @Validate(LanguageValidatorString, {message: 'Unsupported locale key in translationsLocales'})
  locale: string;
}
