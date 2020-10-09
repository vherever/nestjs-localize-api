import { SharedProjectEntity } from '../shared-project.entity';

export class SharedProjectResponse {
  constructor(shared: SharedProjectEntity) {
    this.targetUuid = shared.targetUuid;
    this.projectUuid = shared.projectUuid;
    this.role = shared.role;
    this.availableTranslationLocales = shared.availableTranslationLocales;
  }

  targetUuid: string;
  projectUuid: string;
  role: string;
  availableTranslationLocales: string;
}
