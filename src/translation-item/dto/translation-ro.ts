import * as moment from 'moment';
// app imports
import { TranslationEntity } from '../translation.entity';
import { UserEntity } from '../../auth/user.entity';

export class TranslationRO {
  constructor(
    translation: TranslationEntity,
  ) {
    this.id = translation.id;
    this.latestUpdatedAtFormatted = moment(translation.updated).fromNow();
    this.translations = JSON.parse(translation.translations);
    this.assetCode = translation.assetCode;
    this.assetProjectCode = translation.assetProjectCode;
    this.context = translation.context;
    this.notes = translation.notes;
    this.status = translation.status;
    this.projectId = translation.projectId;
    this.authorId = translation.userId;
    this.labels = translation.labels;
    this.author = this.getAuthorName(translation.user);
  }

  private id: number;
  private latestUpdatedAtFormatted: string;
  private translations: Translations;
  private assetCode: string;
  private assetProjectCode: string;
  private context: string;
  private notes: string;
  private status: string;
  private projectId: number;
  private authorId?: number;
  private labels: string;
  private author: string;

  private getAuthorName(user: UserEntity): string {
    return user.name ? user.name : '';
  }
}

interface Translations {
  [key: string]: string;
}
