import { IsIn, IsNotEmpty, IsString } from 'class-validator';
// app imports
import { RoleEnum } from '../../shared/enums/role.enum';

export class ShareProjectDTO {
  @IsString()
  @IsNotEmpty()
  targetEmail: string;

  @IsNotEmpty()
  projectUuid: string;

  @IsNotEmpty()
  @IsIn([RoleEnum.TRANSLATOR, RoleEnum.DEVELOPER])
  role: RoleEnum;

  @IsNotEmpty()
  availableTranslationLocales: string;
}
