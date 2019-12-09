import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { GetLanguages } from './get-languages';

@ValidatorConstraint()
export class LanguageValidatorObject extends GetLanguages implements ValidatorConstraintInterface {

  async validate(translations: string): Promise<boolean> {
    const parsed = JSON.parse(translations);
    return this.getLanguages().then(languages => {
      const temp = [];
      for (const l of Object.keys(parsed)) {
        const found = languages.find(language => l === language.key);
        temp.push(found);
      }
      return !!!temp.filter(f => f === undefined).length;
    });
  }
}
