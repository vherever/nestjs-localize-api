import * as moment from 'moment';
// app imports
import { ProjectEntity } from '../project.entity';
import { RoleEnum } from '../../shared/enums/role.enum';
import { SharedProjectEntity } from '../../shared-project/shared-project.entity';
import { UserEntity } from '../../auth/user.entity';

export class GetProjectResponse {
  constructor(project: ProjectEntity, role: RoleEnum) {
    this.id = project.id;
    this.title = project.title;
    this.description = project.description;
    this.defaultLocale = project.defaultLocale;
    this.translationsLocales = project.translationsLocales;
    this.ownerId = project.ownerId;
    this.latestUpdatedAtFormatted = moment(project.latestUpdatedAt).fromNow();
    this.role = role;
    this.sharedWith = project.shares;
  }
  id: number;
  title: string;
  description: string;
  defaultLocale: string;
  translationsLocales: string;
  ownerId: number;
  latestUpdatedAtFormatted: string;
  role: string;
  sharedWith: SharedWithInterface[];
}

interface SharedWithInterface {
  targetId: number;
  senderId: number;
  projectId: number;
  role: string;
  user?: UserEntity;
}
