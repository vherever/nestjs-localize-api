import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
// app imports
import { AppData } from '../../data/app-data';

const localesArr = AppData.localesArr;

@ValidatorConstraint()
export class LanguageValidatorString implements ValidatorConstraintInterface {

  async validate(locales: string): Promise<boolean> {
    if (locales) {
      const splitted = locales.split(',');
      if (splitted.length > 1) {
        const temp = splitted.reduce((acc, curr) => {
          const found = localesArr.find(locale => curr === locale);
          acc.push(found);
          return acc;
        }, []);
        return !!!temp.filter(f => f === undefined).length;
      } else {
        return !!localesArr.find(locale => locales === locale);
      }
    }
    return await false;
  }
}
