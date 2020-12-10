import * as moment from 'moment';
// app imports
import { TranslationEntity } from '../translation.entity';
import { UserEntity } from '../../auth/user.entity';
import { GetUserResponse } from '../../user/dto/get-user-response';

export class TranslationRO {
  constructor(
    translation: TranslationEntity,
  ) {
    this.id = translation.id;
    this.uuid = translation.uuid;
    this.latestUpdatedAtFormatted = moment(translation.updated).fromNow();
    this.translations = JSON.parse(translation.translations);
    this.assetCode = translation.assetCode;
    this.assetProjectCode = translation.assetProjectCode;
    this.notes = translation.notes;
    this.status = translation.status;
    this.projectId = translation.projectId;
    this.authorId = translation.userId;
    this.labels = translation.labels;
    this.author = this.getAuthorName(translation.user);
    this.updatedBy = translation.userLastUpdatedId ? new GetUserResponse(translation.userLastUpdatedId) : null;
  }

  private id: number;
  private uuid: string;
  private latestUpdatedAtFormatted: string;
  private translations: Translations;
  private assetCode: string;
  private assetProjectCode: string;
  private notes: string;
  private status: string;
  private projectId: number;
  private authorId?: number;
  private labels: string;
  private author: string;
  private updatedBy: GetUserResponse;

  private getAuthorName(user: UserEntity): string {
    return user.name ? user.name : user.email;
  }
}

interface Translations {
  [key: string]: string;
}
