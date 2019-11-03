import { ProjectEntity } from '../project.entity';
import { RoleEnum } from '../../shared/enums/role.enum';

export interface GetSharedProjectResponse {
  targetId: number;
  senderId: number;
  projectId: number;
  role: RoleEnum;
  project: ProjectEntity;
}
