import * as loadJsonFile from 'load-json-file';
import { LanguageModel } from '../models/language.model';

export class GetLanguages {
  private languagesCached: LanguageModel[] = [];

  async getLanguages(): Promise<LanguageModel[]> {
    return await this._getLanguages();
  }

  private loadJson(src: string): Promise<any> {
    return (async () => {
      return await loadJsonFile(src);
    })();
  }

  private async loadLanguages(): Promise<LanguageModel[]> {
    return await this.loadJson('src/data/languages-formatted.json');
  }

  private async _getLanguages(): Promise<LanguageModel[]> {
    if (!this.languagesCached.length) {
      await this.loadLanguages().then(l => {
        this.languagesCached = l;
      });
    }
    return Promise.resolve(this.languagesCached);
  }
}
