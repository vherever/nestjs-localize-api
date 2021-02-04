import * as fs from 'fs';
import * as path from 'path';
import { InternalServerErrorException } from '@nestjs/common';
import { ExportDTO } from './dto/export.dto';

const util = require('util');
const admZip = require('adm-zip');
const contentDisposition = require('content-disposition');

const readdir = util.promisify(fs.readdir);
const folderPath = path.join(__dirname, '..', '..', 'export');

export class FileSaver {
  public static async saveFile(
    dataset: Array<{ assetCode: string, translations: string }>,
    res: any,
    queryDTO: ExportDTO,
  ): Promise<any> {
    const languagesToTranslate = queryDTO.l;
    const fileFormat = queryDTO.f;
    const assetType = queryDTO.t;
    if (!languagesToTranslate) {
      const message = 'No languages to translate selected. Please select at least one language.';
      throw new InternalServerErrorException(message);
    }
    if (!fileFormat) {
      const message = 'File format missing.';
      throw new InternalServerErrorException(message);
    }
    if (!assetType) {
      const message = 'Asset type missing.';
      throw new InternalServerErrorException(message);
    }
    await FileSaver.getDatasetByLanguage(dataset, languagesToTranslate, fileFormat, assetType, res);
  }

  private static async getDatasetByLanguage(
    dataset: Array<{ assetCode: string, translations: string }>,
    languagesToTranslate: string,
    fileFormat: string,
    assetType: string,
    res: any,
  ): Promise<any> {
    res.set('Access-Control-Expose-Headers', 'Content-Disposition');
    const languagesArr = languagesToTranslate.split(',');

    // switch (fileFormat) {
    //   case 'json':
    //     return ;
    //   case 'php':
    //     return ;
    // }

    if (languagesArr.length > 1) {
      const archiveName = `assets-${fileFormat}.zip`;
      const zip = new admZip();
      for (const lang of languagesArr) {
        const fileDataByLanguage = this.getAssetDataByLanguageAndFileType(dataset, lang);

        const filepath = path.join(folderPath, `${lang}.${fileFormat}`);

        fs.writeFileSync(`${filepath}`, JSON.stringify(fileDataByLanguage));
        zip.addLocalFile(filepath);
      }
      const data = zip.toBuffer();
      zip.writeZip(folderPath + '/' + archiveName);

      res.set('Content-Type', 'application/octet-stream');
      res.set('Content-Disposition', contentDisposition(archiveName));
      res.set('Content-Length', data.length);
      res.send(data);

      await this.clearFiles(folderPath);
    } else {
      const lang = languagesArr[0];
      const fileDataByLanguage = this.getAssetDataByLanguageAndFileType(dataset, lang);

      const filepath = path.join(folderPath, `${lang}.${fileFormat}`);
      fs.writeFileSync(`${filepath}`, JSON.stringify(fileDataByLanguage));

      res.set('Content-Disposition', contentDisposition(`${lang}.${fileFormat}`));

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

  private static getAssetDataByLanguageAndFileType(dataset: Array<{ assetCode: string, translations: string }>, lang: string): any {
    return dataset.reduce((acc: any, curr) => {
      const emptyObj = {};
      const translationValue = JSON.parse(curr.translations)[lang];
      emptyObj[curr.assetCode] = translationValue ? translationValue : '';
      acc = { ...acc, ...emptyObj };
      return acc;
    }, {});
  }
}
