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

  private async loadLanguages(): Promise<LanguageModel[]> {
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

  private async getLanguages(): Promise<LanguageModel[]> {
    return await this._getLanguages();
  }

  validate(locales: string) {
    if (locales) {
      const splitted = locales.split(',');
      return this.getLanguages().then(languages => {
        if (splitted.length > 1) {
          const temp = [];
          splitted.forEach(l => {
            const found = languages.find(language => l === language.key);
            temp.push(found);
          });
          return !!!temp.filter(f => f === undefined).length;
        } else {
          return !!languages.find(language => locales === language.key);
        }
      });
    }
    return false;
  }
}
