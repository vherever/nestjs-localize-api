import * as fs from 'fs';
import * as path from 'path';
const contentDisposition = require('content-disposition');

export class FileSaver {
  public static async saveFile(dataset: any, res: any, languages: string, lang?: string): Promise<any> {
    await FileSaver.getDatasetByLanguage(dataset, res, lang);
  }

  private static async getDatasetByLanguage(dataset: any[], res: any, lang: string): Promise<any> {
    const fileDataByLanguage = dataset.reduce((acc: any, curr) => {
      const emptyObj = {};
      emptyObj[curr.assetCode] = JSON.parse(curr.translations)[lang];
      acc = {...acc, ...emptyObj};
      return acc;
    }, {});
    const filepath = path.join(__dirname, '..', '..', 'static', `${lang}.json`);
    fs.writeFileSync(`${filepath}`, JSON.stringify(fileDataByLanguage));
    res.set('Access-Control-Expose-Headers', 'Content-Disposition');
    res.set('Content-Disposition', contentDisposition(`${lang}.json`));
    const file = await new Promise<Buffer>((resolve, reject) => {
      fs.readFile(filepath, {}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    res.send(file);

    // remove file from folder
    fs.unlink(filepath, (err) => {
      if (err) {
        return;
      }
    });
  }
}
