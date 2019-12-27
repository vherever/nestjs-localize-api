import { ProjectEntity } from '../project.entity';
import * as moment from 'moment';

export class GetProjectResponse {
  constructor(project: ProjectEntity) {
    this.id = project.id;
    this.title = project.title;
    this.description = project.description;
    this.defaultLocale = project.defaultLocale;
    this.translationsLocales = project.translationsLocales;
    this.ownerId = project.ownerId;
    this.latestUpdatedAtFormatted = moment(project.latestUpdatedAt).fromNow();
  }
  id: number;
  title: string;
  description: string;
  defaultLocale: string;
  translationsLocales: string;
  ownerId: number;
  latestUpdatedAtFormatted: string;
}
