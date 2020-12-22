import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as loadJsonFile from 'load-json-file';
// app imports
const fs = require('fs');
import { TranslationEntity } from '../translation-item/translation.entity';
import { UserEntity } from '../auth/user.entity';
import { ExportDTO } from './dto/export.dto';
import * as path from 'path';
const contentDisposition = require('content-disposition');

@Injectable()
export class ExportImportService {
  constructor(
    @InjectRepository(TranslationEntity)
    private readonly translationRepository: Repository<TranslationEntity>,
  ) {
  }

  private loadJson(src: string): Promise<any> {
    return (async () => {
      return await loadJsonFile(src);
    })();
  }

  public async exportTranslations(
    user: UserEntity,
    projectUuid: string,
    queryDTO: ExportDTO,
    res: any,
  ): Promise<any> {
    const lang = queryDTO.lang || 'gb-en';
    const foundAllTranslations = await this.translationRepository.find({ where: { projectUuid } });
    const fileDataByLanguage = foundAllTranslations.reduce((acc: any, curr) => {
      const emptyObj = {};
      emptyObj[curr.assetCode] = JSON.parse(curr.translations)[lang];
      acc = {...acc, ...emptyObj};
      return acc;
    }, {});
    const filepath = path.join(__dirname, '..', '..', 'public', `${lang}.json`);
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
