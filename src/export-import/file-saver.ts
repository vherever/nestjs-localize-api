import * as fs from 'fs';
import * as path from 'path';

const util = require('util');
const admZip = require('adm-zip');
const contentDisposition = require('content-disposition');

const readdir = util.promisify(fs.readdir);
const folderPath = path.join(__dirname, '..', '..', 'export');
const zip = new admZip();

export class FileSaver {
  public static async saveFile(
    dataset: any[],
    res: any,
    languagesToTranslate: string): Promise<any> {
    await FileSaver.getDatasetByLanguage(dataset, res, languagesToTranslate);
  }

  private static async getDatasetByLanguage(
    dataset: any[],
    res: any,
    languagesToTranslate: string,
  ): Promise<any> {
    const languagesArr = languagesToTranslate.split(',');
    const archiveName = 'assets-json.zip';

    if (languagesArr.length > 1) {
      for (const lang of languagesArr) {
        const fileDataByLanguage = this.getFileDataByLanguage(dataset, lang);

        const filepath = path.join(folderPath, `${lang}.json`);

        fs.writeFileSync(`${filepath}`, JSON.stringify(fileDataByLanguage));

        zip.addLocalFile(filepath);
      }
      const data = zip.toBuffer();
      zip.writeZip(folderPath + '/' + archiveName);

      res.set('Access-Control-Expose-Headers', 'Content-Disposition');
      res.set('Content-Type', 'application/octet-stream');
      res.set('Content-Disposition', contentDisposition(archiveName));
      res.set('Content-Length', data.length);
      res.send(data);

      await this.clearFiles(folderPath);
    } else {
      const lang = languagesArr[0];
      const fileDataByLanguage = this.getFileDataByLanguage(dataset, lang);

      const filepath = path.join(folderPath, `${lang}.json`);
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

      await this.clearFiles(folderPath);
    }
  }

  private static async clearFiles(directory: string): Promise<any> {
    try {
      const files = await readdir(directory);
      const unlinkPromises = files.map(filename => fs.unlink(`${directory}/${filename}`, (err) => {
        if (err) {
          return;
        }
      }));
      return Promise.all(unlinkPromises);
    } catch (err) {
      return;
    }
  }

  private static getFileDataByLanguage(dataset: any[], lang: string): any {
    return dataset.reduce((acc: any, curr) => {
      const emptyObj = {};
      emptyObj[curr.assetCode] = JSON.parse(curr.translations)[lang];
      acc = { ...acc, ...emptyObj };
      return acc;
    }, {});
  }
}
