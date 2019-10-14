import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { LanguageModel } from '../models/language.model';
import * as loadJsonFile from 'load-json-file';

@ValidatorConstraint()
export class LanguageValidator implements ValidatorConstraintInterface {
  private languagesCached: LanguageModel[] = [];

  private loadJson(src: string): Promise<any> {
    return (async () => {
      return await loadJsonFile(src);
    })();
  }

  async loadLanguages(): Promise<LanguageModel[]> {
    return await this.loadJson('src/data/languages.json');
  }

  private async _getLanguages(): Promise<LanguageModel[]> {
    if (!this.languagesCached.length) {
      await this.loadLanguages().then(l => {
        this.languagesCached = l;
      });
    }
    return Promise.resolve(this.languagesCached);
  }

  async getLanguages(): Promise<LanguageModel[]> {
    return await this._getLanguages();
  }

  validate(locale: string) {
    return this.getLanguages().then(languages => {
      return !!languages.find(language => locale === language.key);
    });
  }
}
