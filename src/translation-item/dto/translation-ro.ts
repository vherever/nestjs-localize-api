import { TranslationEntity } from '../translation.entity';

export class TranslationRO {
  constructor(
    translation: TranslationEntity,
  ) {
    this.id = translation.id;
    this.created = translation.created;
    this.updated = translation.updated;
    this.translations = JSON.parse(translation.translations);
    this.assetCode = translation.assetCode;
    this.assetProjectCode = translation.assetProjectCode;
    this.context = translation.context;
    this.notes = translation.notes;
    this.status = translation.status;
    this.projectId = translation.projectId;
    this.authorId = translation.userId;
    this.labels = translation.labels;
  }

  id: number;
  created: Date;
  updated: Date;
  translations: Translations;
  assetCode: string;
  assetProjectCode: string;
  context: string;
  notes: string;
  status: string;
  projectId: number;
  authorId?: number;
  labels: string;
  avatar: string;
  name: string;
}

interface Translations {
  [key: string]: string;
}
