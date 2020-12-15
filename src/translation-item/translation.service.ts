import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../auth/user.entity';
import { TranslationEntity } from './translation.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { TranslationRO } from './dto/translation-ro';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';

import * as uuidv1 from 'uuid/v1';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';
import { UpdateTranslationDTO } from './dto/update-translation-settings.dto';
import { LabelEntity } from '../label/label.entity';

@Injectable()
export class TranslationService {
  private logger = new Logger('TranslationService');

  constructor(
    @InjectRepository(TranslationEntity)
    private translationRepository: Repository<TranslationEntity>,

    @InjectRepository(LabelEntity)
    private labelRepository: Repository<LabelEntity>,

    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,

    @InjectRepository(SharedProjectEntity)
    private sharedProjectRepository: Repository<SharedProjectEntity>,
  ) {
  }

  private async getTranslationsRO(translations: TranslationEntity[], defaultLocale?: string): Promise<TranslationRO[]> {
    return translations
      .sort((a, b) => a.id - b.id) // sort ASC by id
      .map((translation: TranslationEntity) => {
        if (defaultLocale) {
          translation.translations = JSON.stringify(Object.assign({[defaultLocale]: ''}, JSON.parse(translation.translations)));
        }
        return new TranslationRO(translation);
      });
  }

  async getAllTranslationsByProject(
    projectId: string,
    user: UserEntity,
  ): Promise<TranslationRO[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId }, relations: ['translations', 'translations.project'] });
    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }
    return this.getTranslationsRO(project.translations);
  }

  async getTranslationsByProject(
    projectUuid: string,
    user: UserEntity,
  ): Promise<TranslationRO[]> {
    const project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id }, relations: ['translations', 'translations.user', 'translations.userLastUpdatedId'] });
    const shared = await SharedProjectEntity.findOne({ where: { projectUuid } });

    let sharedFromProjects: ProjectEntity;
    let defaultLocale: string;

    let translations: TranslationEntity[];

    if (!project && !shared) {
      this.logger.error(`Project with id "${projectUuid}" not found.`);
      throw new NotFoundException(`Project with id "${projectUuid}" not found.`);
    }

    if (project) {
      translations = project.translations;
      defaultLocale = project.defaultLocale;
    }
    if (shared && !project) {
      sharedFromProjects = await this.projectRepository.findOne({ where: { id: shared.projectId }, relations: ['translations', 'translations.user', 'translations.userLastUpdatedId'] });
      translations = sharedFromProjects.translations;
      defaultLocale = sharedFromProjects.defaultLocale;
    }
    return this.getTranslationsRO(translations, defaultLocale);
  }

  async createTranslation(
    createTranslationDTO: CreateTranslationDTO,
    user: UserEntity,
    projectUuid: string,
  ): Promise<TranslationRO[]> {
    // const uuid = uuidv1();
    const project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id }, relations: ['translations', 'translations.userLastUpdatedId'] });

    const shared = await SharedProjectEntity.findOne({ where: { targetId: user.id, projectUuid }, relations: ['project'] });

    if (!project && !shared) {
      this.logger.error(`Project with id "${projectUuid}" not found.`);
      throw new NotFoundException(`Project with id "${projectUuid}" not found.`);
    }

    const projectToUse: ProjectEntity = shared ? shared.project : project;

    const translation: TranslationEntity = await this.translationRepository.create({
      project: projectToUse,
      ...createTranslationDTO,
      user,
    });

    translation.assetProjectCode = projectUuid + '-' + createTranslationDTO.assetCode;
    translation.userLastUpdatedId = user;

    try {
      await this.projectRepository.update({ uuid: projectUuid }, {});
      await this.translationRepository.save(translation);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`${error.detail}`);
        throw new ConflictException(`${error.detail}`);
      } else {
        this.logger.error('Can not create translation.');
        throw new InternalServerErrorException();
      }
    }
    return this.getTranslationsRO([translation]);
  }

  async updateTranslation(
    updateTranslationDTO: UpdateTranslationDTO,
    isAssetSettings: boolean,
    user: UserEntity,
    projectUuid: string,
    translationUuid: string,
  ): Promise<TranslationRO[]> {
    const project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id }, relations: ['translations', 'translations.project', 'translations.user'] });
    const shared = await SharedProjectEntity.findOne({ where: { targetId: user.id, projectUuid }, relations: ['project'] });
    let translation;

    if (!project && !shared) {
      this.logger.error(`Project with id "${projectUuid}" not found.`);
      throw new NotFoundException(`Project with id "${projectUuid}" not found.`);
    }

    if (project) {
      translation = await project.translations.find((t: TranslationEntity) => t.uuid === translationUuid);
    }

    if (shared) {
      translation = await this.translationRepository.findOne({ where: { uuid: translationUuid, targetId: user.id } });
    }

    if (!translation) {
      this.logger.error(`Translation with id "${translationUuid}" not found.`);
      throw new NotFoundException(`Translation with id "${translationUuid}" not found.`);
    }
    try {
      if (!isAssetSettings) {
        await this.projectRepository.update({ uuid: projectUuid }, {});
        await this.translationRepository.update({ uuid: translationUuid }, {
          assetCode: updateTranslationDTO.assetCode,
          translations: updateTranslationDTO.translations,
          assetProjectCode: `${projectUuid}-${updateTranslationDTO.assetCode}`,
          userLastUpdatedId: user,
        });
      } else {
        await this.translationRepository.update({ uuid: translationUuid }, {
          assetProjectCode: `${projectUuid}-${updateTranslationDTO.assetCode}`,
          assetCode: updateTranslationDTO.assetCode,
        });
      }
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`${error.detail}`);
        throw new ConflictException(`${error.detail}`);
      } else {
        this.logger.error(`Failed to update translation for user "${user.email}", projectId: "${project.id}". Data: ${JSON.stringify(updateTranslationDTO)}.`, error.stack);
        throw new InternalServerErrorException();
      }
    }

    translation = await this.translationRepository.findOne({ where: { uuid: translationUuid, targetId: user.id }, relations: ['user', 'userLastUpdatedId'] });
    return this.getTranslationsRO([translation]);
  }

  async deleteTranslation(
    projectUuid: string,
    translationUuid: string,
    user: UserEntity,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id }, relations: ['translations'] });
    const shared = await SharedProjectEntity.findOne({ where: { targetId: user.id, projectUuid }, relations: ['project'] });
    let translation;

    if (!project && !shared) {
      this.logger.error(`Project with id "${projectUuid}" not found.`);
      throw new NotFoundException(`Project with id "${projectUuid}" not found.`);
    }

    if (project) {
      translation = await project.translations.find((t: TranslationEntity) => t.uuid === translationUuid);
    }

    if (shared) {
      translation = await this.translationRepository.findOne({ where: { uuid: translationUuid, targetId: user.id } });
    }

    if (!translation) {
      this.logger.error(`Translation with id "${translationUuid}" not found.`);
      throw new NotFoundException(`Translation with id "${translationUuid}" not found.`);
    }
    try {
      await this.projectRepository.update({ uuid: projectUuid }, {});
      await this.translationRepository.delete({ uuid: translationUuid });
    } catch (error) {
      this.logger.error(`Failed to delete translation for user "${user.email}", projectId: "${projectUuid}".`, error.stack);
      throw new InternalServerErrorException();
    }
  }
}
