import { TranslationEntity } from '../translation.entity';

export class TranslationRO {
  constructor(
    translation: TranslationEntity,
  ) {
    this.id = translation.id;
    this.created = translation.created;
    this.updated = translation.updated;
    this.sourceText = JSON.parse(JSON.stringify(translation.sourceText));
    this.assetCode = translation.assetCode;
    this.assetCodeSrc = translation.assetCodeSrc;
    this.context = translation.context;
    this.notes = translation.notes;
    this.status = translation.status;
    this.language = translation.language;
    this.projectId = translation.projectId;
    this.authorId = translation.userId;
    this.labels = translation.labels;
  }

  id: number;
  created: Date;
  updated: Date;
  sourceText: SourceText[];
  assetCode: string;
  assetCodeSrc: string;
  context: string;
  notes: string;
  status: string;
  language: string;
  projectId: number;
  authorId?: number;
  labels: string;
}

export interface SourceText {
  [key: string]: string;
}
