import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { LanguageValidator } from '../../shared/validators/language-validator';

export class CreateProjectDTO {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @Validate(LanguageValidator, {message: 'Invalid defaultLocale'})
  defaultLocale: string;

  @IsOptional()
  @Validate(LanguageValidator, {message: 'Invalid translationsLocales'})
  translationsLocales: string;
}
