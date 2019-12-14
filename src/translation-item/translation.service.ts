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

@Injectable()
export class TranslationService {
  private logger = new Logger('TranslationService');

  constructor(
    @InjectRepository(TranslationEntity)
    private translationRepository: Repository<TranslationEntity>,

    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,

    @InjectRepository(SharedProjectEntity)
    private sharedProjectRepository: Repository<SharedProjectEntity>,
  ) {
  }

  private async getTranslationsRO(translations: TranslationEntity[]): Promise<TranslationRO[]> {
    return translations
      .sort((a, b) => a.id - b.id) // sort ASC by id
      .map((translation: TranslationEntity) => {
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

  async getUserTranslationsByProject(
    projectId: string,
    user: UserEntity,
  ): Promise<TranslationRO[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id }, relations: ['translations', 'translations.project'] });
    const shared = await SharedProjectEntity.findOne({ where: { projectId }, relations: ['project'] });

    let sharedFromProjects;

    const translations: TranslationEntity[] = [];

    if (!project && !shared) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }
    if (project) {
      translations.push(...project.translations);
    }
    if (shared) {
      sharedFromProjects = await this.projectRepository.findOne({ where: { id: shared.projectId }, relations: ['translations'] });
      translations.push(...sharedFromProjects.translations);
    }
    return this.getTranslationsRO(translations);
  }

  async createTranslation(
    createTranslationDTO: CreateTranslationDTO,
    user: UserEntity,
    projectId: number,
  ): Promise<TranslationRO[]> {
    const uuid = uuidv1();
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });

    const shared = await SharedProjectEntity.findOne({ where: { targetId: user.id, projectId }, relations: ['project'] });

    if (!project && !shared) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }

    const projectToUse: ProjectEntity = shared ? shared.project : project;

    const translation: TranslationEntity = await this.translationRepository.create({
      project: projectToUse,
      ...createTranslationDTO,
      user,
    });

    translation.assetProjectCode = projectId + '-' + createTranslationDTO.assetCode;

    try {
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
    updateTranslationDTO: CreateTranslationDTO,
    user: UserEntity,
    projectId: number,
    translationId: number,
  ): Promise<TranslationRO[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });

    let translation = await this.translationRepository.findOne({ where: { id: translationId, userId: user.id } });

    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }

    if (!translation) {
      this.logger.error(`Translation with id "${translationId}" not found.`);
      throw new NotFoundException(`Translation with id "${translationId}" not found.`);
    }
    try {
      await this.translationRepository.update({id: translationId}, {
        assetCode: updateTranslationDTO.assetCode,
        translations: updateTranslationDTO.translations,
        assetProjectCode: `${projectId}-${updateTranslationDTO.assetCode}`,
      });
    } catch (error) {
      this.logger.error(`Failed to update translation for user "${user.email}", projectId: "${project.id}". Data: ${JSON.stringify(updateTranslationDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }

    translation = await this.translationRepository.findOne({ where: { id: translationId, userId: user.id } });
    return this.getTranslationsRO([translation]);
  }

  async deleteTranslation(
    projectId: number,
    translationId: number,
    user: UserEntity,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });

    const translations = await this.translationRepository.find({ where: { id: translationId, userId: user.id } });

    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }

    if (!translations) {
      this.logger.error(`Translation with id "${translationId}" not found.`);
      throw new NotFoundException(`Translation with id "${translationId}" not found.`);
    }

    await this.translationRepository.delete({ id: translationId, user });
  }
}
