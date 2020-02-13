import { IsNotEmpty, IsString } from 'class-validator';

export class ManagePermissionsDTO {
  @IsString()
  @IsNotEmpty()
  targetId: number;

  @IsNotEmpty()
  projectId: number;

  @IsNotEmpty()
  translationLocales: string;
}
