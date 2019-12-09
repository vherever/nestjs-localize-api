import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { GetLanguages } from './get-languages';

@ValidatorConstraint()
export class LanguageValidatorString extends GetLanguages implements ValidatorConstraintInterface {

  async validate(locales: string): Promise<boolean> {
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
    return await false;
  }
}
