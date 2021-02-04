import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// app imports
import { TranslationEntity } from '../translation-item/translation.entity';
import { UserEntity } from '../auth/user.entity';
import { ExportDTO } from './dto/export.dto';
import { FileSaver } from './file-saver';
import { ProjectEntity } from '../project/project.entity';

@Injectable()
export class ExportImportService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,

    @InjectRepository(TranslationEntity)
    private readonly translationRepository: Repository<TranslationEntity>,
  ) {
  }

  public async exportTranslations(
    user: UserEntity,
    projectUuid: string,
    queryDTO: ExportDTO,
    res: any,
  ): Promise<any> {
    const foundAllTranslations: Array<{assetCode: string, translations: string}> = (await this.translationRepository.find({ where: { projectUuid } }))
      .map((translationEntity) => {
        return {
          assetCode: translationEntity.assetCode,
          translations: translationEntity.translations,
        };
      });
    await FileSaver.saveFile(foundAllTranslations, res, queryDTO);
  }
}
