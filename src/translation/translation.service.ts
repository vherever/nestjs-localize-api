import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../auth/user.entity';
import { TranslationEntity } from './translation.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { GetTranslationResponseDTO } from './dto/get-translation-response.dto';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';

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

  private getTranslationsRO(translations: TranslationEntity[]): GetTranslationResponseDTO[] {
    return translations.map((translation: TranslationEntity) => {
      return {
        sourceText: translation.sourceText,
        assetId: translation.assetId,
        context: translation.context,
        labels: translation.labels,
        notes: translation.notes,
      };
    });
  }

  async getTranslationsByProject(
    id: string,
  ): Promise<GetTranslationResponseDTO[]> {
    const project = await this.projectRepository.findOne({ where: { id }, relations: ['translations', 'translations.project'] });
    if (!project) {
      this.logger.error(`Project with id ${id} not found.`);
      throw new NotFoundException(`Project with id "${id}" not found.`);
    }
    return this.getTranslationsRO(project.translations);
  }

  async createTranslation(
    createTranslationDTO: CreateTranslationDTO,
    user: UserEntity,
    projectId: string,
  ): Promise<TranslationEntity> {

    const project = await this.projectRepository.findOne({ where: { id: projectId } });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    const translation = await this.translationRepository.create({
      project,
      ...createTranslationDTO,
    });

    await this.translationRepository.save(translation);
    return translation;
  }
}
