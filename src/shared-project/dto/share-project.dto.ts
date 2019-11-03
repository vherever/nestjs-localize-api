import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { RoleEnum } from '../../shared/enums/role.enum';

export class ShareProjectDTO {
  @IsNotEmpty()
  targetId: number;

  @IsNotEmpty()
  projectId: number;

  @IsOptional()
  @IsIn([RoleEnum.TRANSLATOR, RoleEnum.DEVELOPER])
  role: RoleEnum;
}
