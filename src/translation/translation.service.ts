import { Injectable, InternalServerErrorException, Logger, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../auth/user.entity';
import { TranslationEntity } from './translation.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { GetTranslationResponseDTO } from './dto/get-translation-response.dto';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';
import { GetUser } from '../auth/get-user.decorator';

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

  private async getTranslationsRO(translations: TranslationEntity[]): Promise<GetTranslationResponseDTO[]> {
    return translations.map((translation: TranslationEntity) => {
      return {
        id: translation.id,
        sourceText: translation.sourceText,
        assetId: translation.assetId,
        context: translation.context,
        labels: translation.labels,
        notes: translation.notes,
        projectId: translation.project.id,
        authorId: translation.project.userId,
      };
    });
  }

  private getTranslationRO(translation: TranslationEntity): GetTranslationResponseDTO {
    return {
      id: translation.id,
      sourceText: translation.sourceText,
      assetId: translation.assetId,
      context: translation.context,
      labels: translation.labels,
      notes: translation.notes,
      projectId: translation.project.id,
      authorId: translation.user.id,
    };
  }

  async getTranslationsByProject(
    projectId: string,
    @GetUser() user: UserEntity,
  ): Promise<GetTranslationResponseDTO[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id }, relations: ['translations', 'translations.project'] });
    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }
    return await this.getTranslationsRO(project.translations);
  }

  async createTranslation(
    createTranslationDTO: CreateTranslationDTO,
    user: UserEntity,
    projectId: number,
  ): Promise<GetTranslationResponseDTO> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });
    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }

    const translation = await this.translationRepository.create({
      project,
      ...createTranslationDTO,
      user,
    });
    try {
      await this.translationRepository.save(translation);
    } catch (error) {
      this.logger.error(`Failed to create translation for user "${user.username}", projectId: "${project.id}". Data: ${JSON.stringify(createTranslationDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
    return this.getTranslationRO(translation);
  }

  async updateTranslation(
    updateTranslationDTO: CreateTranslationDTO,
    user: UserEntity,
    projectId: number,
    translationId: number,
  ): Promise<TranslationEntity> {
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
      await this.translationRepository.update({id: translationId}, updateTranslationDTO);
    } catch (error) {
      this.logger.error(`Failed to update translation for user "${user.username}", projectId: "${project.id}". Data: ${JSON.stringify(updateTranslationDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
    translation = await this.translationRepository.findOne({ where: { id: translationId } });
    return translation;
  }

  async deleteTranslation(
    @Param('id') projectId: number,
    @Param('translationId') translationId: number,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });
    const translation = await this.translationRepository.findOne({ where: { id: translationId, userId: user.id } });

    if (!project) {
      this.logger.error(`Project with id "${projectId}" not found.`);
      throw new NotFoundException(`Project with id "${projectId}" not found.`);
    }

    if (!translation) {
      this.logger.error(`Translation with id "${translationId}" not found.`);
      throw new NotFoundException(`Translation with id "${translationId}" not found.`);
    }

    await this.translationRepository.delete({ id: translationId, user });
  }
}
