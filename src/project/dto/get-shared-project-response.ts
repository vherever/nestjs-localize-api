import { ProjectEntity } from '../project.entity';

export interface GetSharedProjectResponse {
  targetId: number;
  senderId: number;
  projectId: number;
  project: ProjectEntity;
}
