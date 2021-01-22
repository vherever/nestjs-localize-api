import * as moment from 'moment';
// app imports
import { ProjectEntity } from '../project.entity';
import { RoleEnum } from '../../shared/enums/role.enum';
import { UserEntity } from '../../auth/user.entity';
import { LabelEntity } from '../../label/label.entity';

export class GetProjectResponse {
  constructor(project: ProjectEntity, role: RoleEnum) {
    this.id = project.id;
    this.uuid = project.uuid;
    this.title = project.title;
    this.description = project.description;
    this.defaultLocale = project.defaultLocale;
    this.translationsLocales = project.translationsLocales || '';
    this.ownerId = project.ownerId;
    this.latestUpdatedAtFormatted = moment(project.updated).fromNow();
    this.role = role;
    this.sharedWith = project.shares;
    this.updated = project.updated;
    this.created = project.created;
    this.labels = project.labels;
  }
  id: number;
  uuid: string;
  title: string;
  description: string;
  defaultLocale: string;
  translationsLocales: string;
  ownerId: number;
  latestUpdatedAtFormatted: string;
  role: string;
  sharedWith: SharedWithInterface[];
  updated: Date;
  created: Date;
  labels: LabelEntity[];
}

interface SharedWithInterface {
  targetId: number;
  senderId: number;
  projectId: number;
  role: string;
  user?: UserEntity;
}
