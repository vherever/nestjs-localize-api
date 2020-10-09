import { IsNotEmpty, IsString } from 'class-validator';

export class ManagePermissionsDTO {
  @IsString()
  @IsNotEmpty()
  targetUuid: string;

  @IsNotEmpty()
  projectUuid: string;

  @IsNotEmpty()
  availableTranslationLocales: string;
}
