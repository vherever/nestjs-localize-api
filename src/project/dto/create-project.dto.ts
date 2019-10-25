import { IsIn, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { LanguageValidator } from '../../shared/validators/language-validator';
import { RoleEnum } from '../../shared/enums/role.enum';
import { BaseEntity } from 'typeorm';

export class CreateProjectDTO extends BaseEntity {
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

  @IsOptional()
  @IsIn([RoleEnum.ADMINISTRATOR, RoleEnum.DEVELOPER, RoleEnum.MANAGER, RoleEnum.TRANSLATOR])
  role: RoleEnum;
}
