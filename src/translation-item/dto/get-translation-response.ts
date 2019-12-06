export class GetTranslationRO {
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

  userId?: number;

  labels: string;
}

export interface SourceText {
  [key: string]: string;
}
