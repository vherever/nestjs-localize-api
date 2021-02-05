import * as fs from 'fs';
import * as path from 'path';
import { InternalServerErrorException } from '@nestjs/common';
import { ExportDTO } from './dto/export.dto';
import { TranslationModel } from './models/translation.model';

const util = require('util');
const admZip = require('adm-zip');
const contentDisposition = require('content-disposition');

const readdir = util.promisify(fs.readdir);
const folderPath = path.join(__dirname, '..', '..', 'export');

export class FileSaver {
  public static async saveFile(
    dataset: TranslationModel[],
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
    dataset: TranslationModel[],
    languagesToTranslate: string,
    fileFormat: string,
    assetType: string,
    res: any,
  ): Promise<any> {
    res.set('Access-Control-Expose-Headers', 'Content-Disposition');
    const languagesArr = languagesToTranslate.split(',');

    if (fileFormat === 'json' && assetType === 'multi_language_nesting') {
      res.set('Content-Type', 'application/json');
      res.set('Content-Disposition', contentDisposition(`json-multi-language.${fileFormat}`));

      const dataJSON = languagesArr.reduce((acc, lang) => {
        acc[lang] = this.getAssetDataByLanguageAndFileType(dataset, lang, fileFormat);
        return acc;
      }, {});

      const filepath = path.join(folderPath, `json-multi-language.${fileFormat}`);
      fs.writeFileSync(`${filepath}`, JSON.stringify(dataJSON));

      const file = await this.getFileFromFilePath(filepath);
      res.set('Content-Length', file.length);
      res.send(file);

      await this.clearFiles(folderPath);
      return false;
    }

    if (languagesArr.length > 1) {
      const archiveName = `assets-${fileFormat}.zip`;
      const zip = new admZip();
      for (const lang of languagesArr) {
        const fileDataByLanguage = this.getAssetDataByLanguageAndFileType(dataset, lang, fileFormat);
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

      res.set('Content-Type', 'application/json');
      res.set('Content-Disposition', contentDisposition(`${lang}.${fileFormat}`));

      const fileDataByLanguage = this.getAssetDataByLanguageAndFileType(dataset, lang, fileFormat);
      const filepath = path.join(folderPath, `${lang}.${fileFormat}`);

      fs.writeFileSync(`${filepath}`, JSON.stringify(fileDataByLanguage));

      const file = await this.getFileFromFilePath(filepath);
      res.set('Content-Length', file.length);
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

  private static getAssetDataByLanguageAndFileType(
    dataset: TranslationModel[],
    lang: string,
    fileFormat: string,
  ): any {
    return dataset.reduce((acc: any, curr) => {
      const emptyObj = {};
      const translationValue = JSON.parse(curr.translations)[lang];

      switch (fileFormat) {
        case 'json':
          emptyObj[curr.assetCode] = translationValue ? translationValue : '';
          acc = { ...acc, ...emptyObj };
          return acc;
        case 'php':
          // TODO: continue...
          return;
      }
    }, {});
  }

  private static async getFileFromFilePath(filepath: string): Promise<any> {
    return await new Promise<Buffer>((resolve, reject) => {
      fs.readFile(filepath, {}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
