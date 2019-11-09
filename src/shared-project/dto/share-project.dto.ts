import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RoleEnum } from '../../shared/enums/role.enum';

export class ShareProjectDTO {
  @IsString()
  @IsNotEmpty()
  targetEmail: string;

  @IsNotEmpty()
  projectId: number;

  @IsOptional()
  @IsIn([RoleEnum.TRANSLATOR, RoleEnum.DEVELOPER])
  role: RoleEnum;
}
