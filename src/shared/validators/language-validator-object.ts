import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
// app imports
import { AppData } from '../../data/app-data';

const localesArr = AppData.localesArr;

@ValidatorConstraint()
export class LanguageValidatorObject implements ValidatorConstraintInterface {

  async validate(translations: string): Promise<boolean> {
    const parsed = JSON.parse(translations);
    const temp = Object.keys(parsed).reduce((acc, curr) => {
      const found = localesArr.find(locale => curr === locale);
      acc.push(found);
      return acc;
    }, []);
    return !!!temp.filter(f => f === undefined).length;
  }
}
