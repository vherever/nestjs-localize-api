import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../auth/user.entity';
import { TranslationEntity } from './translation.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { GetTranslationRO } from './dto/get-translation-response';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';

import * as uuidv1 from 'uuid/v1';

@Injectable()
export class TranslationService {
  private logger = new Logger('TranslationService');

  constructor(
    @InjectRepository(TranslationEntity)
    private translationRepository: Repository<TranslationEntity>,

    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
  ) {
  }

  private async getTranslationsRO(translations: TranslationEntity[]): Promise<GetTranslationRO[]> {
    return translations.map((translation: TranslationEntity) => {
      return {
        id: translation.id,
        created: translation.created,
        updated: translation.updated,
        sourceText: translation.sourceText,
        assetCode: translation.assetCode,
        assetCodeSrc: translation.assetCodeSrc,
        context: translation.context,
        labels: translation.labels,
        notes: translation.notes,
        status: translation.status,
        language: translation.language,
        projectId: translation.project.id,
        authorId: translation.project.userId,
      };
    });
  }

  async getAllTranslationsByProject(
    projectId: string,
    user: UserEntity,
  ): Promise<GetTranslationRO[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId }, relations: ['translations', 'translations.project'] });
    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }
    return this.getTranslationsRO(project.translations);
  }

  async getUserTranslationsByProject(
    projectId: string,
    user: UserEntity,
  ): Promise<GetTranslationRO[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id }, relations: ['translations', 'translations.project'] });
    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }
    return this.getTranslationsRO(project.translations);
  }

  async createTranslation(
    createTranslationDTO: CreateTranslationDTO,
    user: UserEntity,
    projectId: number,
  ): Promise<GetTranslationRO[]> {
    const uuid = uuidv1();
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });
    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }

    const translationDefault: TranslationEntity = await this.translationRepository.create({
      project,
      ...createTranslationDTO,
      user,
    });

    const translationsLocales = project.translationsLocales.split(',');

    const translations = translationsLocales.reduce((acc: any, lang) => {
      let translation: TranslationEntity;

      createTranslationDTO.sourceText = '';

      translation = this.translationRepository.create({
        project,
        ...createTranslationDTO,
        user,
      });

      translationDefault.assetGroupId = uuid;
      translation.assetGroupId = uuid;
      translationDefault.language = project.defaultLocale;
      translation.language = lang;
      translationDefault.assetCodeSrc = projectId + '-' + createTranslationDTO.assetCode;
      translation.assetCodeSrc = null;
      acc.push(translation);
      return acc;
    }, []);

    try {
      await this.translationRepository.save([translationDefault, ...translations]);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`${error.detail}`);
        throw new ConflictException(`${error.detail}`);
      } else {
        this.logger.error('Can not create translation.');
        throw new InternalServerErrorException();
      }
    }
    return this.getTranslationsRO([translationDefault, ...translations]);
  }

  async updateTranslation(
    updateTranslationDTO: CreateTranslationDTO,
    user: UserEntity,
    projectId: number,
    assetGroupId: string,
    translationId: string,
  ): Promise<TranslationEntity> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });

    const translations = await this.translationRepository.find({ where: { assetGroupId, userId: user.id } });

    let translation = await translations.find(t => {
      return t.id === parseInt(translationId, 10);
    });

    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }

    if (!translation) {
      this.logger.error(`Translation with id "${translationId}" not found.`);
      throw new NotFoundException(`Translation with id "${translationId}" not found.`);
    }
    try {
      await this.translationRepository.update({assetGroupId}, {assetCode: updateTranslationDTO.assetCode});
      await this.translationRepository.update({assetGroupId, id: parseInt(translationId, 10)}, {sourceText: updateTranslationDTO.sourceText});
      await this.translationRepository.update({assetGroupId, language: project.defaultLocale}, {assetCodeSrc: `${projectId}-${updateTranslationDTO.assetCode}`});
    } catch (error) {
      this.logger.error(`Failed to update translation for user "${user.username}", projectId: "${project.id}". Data: ${JSON.stringify(updateTranslationDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
    translation = await this.translationRepository.findOne({ where: { assetGroupId, id: translationId } });
    return translation;
  }

  async deleteTranslation(
    projectId: number,
    assetGroupId: string,
    user: UserEntity,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });

    const translations = await this.translationRepository.find({ where: { assetGroupId, userId: user.id } });

    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }

    if (!translations) {
      this.logger.error(`Translation group with id "${assetGroupId}" not found.`);
      throw new NotFoundException(`Translation group with id "${assetGroupId}" not found.`);
    }

    await this.translationRepository.delete({ assetGroupId, user });
  }
}
