import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// app imports
import { LabelEntity } from '../label/label.entity';
import { UserEntity } from '../auth/user.entity';
import { ProjectEntity } from '../project/project.entity';
import { TranslationEntity } from '../translation-item/translation.entity';
import { TranslationLabelEntity } from './translation-label.entity';
import { GetLabelsResponse } from '../label/dto/get-labels-response';

@Injectable()
export class TranslationLabelService {
  private logger = new Logger('TranslationSharedLabelService');

  constructor(
    @InjectRepository(LabelEntity)
    private labelRepository: Repository<LabelEntity>,
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
    @InjectRepository(TranslationEntity)
    private translationRepository: Repository<TranslationEntity>,
    @InjectRepository(TranslationLabelEntity)
    private translationSharedLabelRepository: Repository<TranslationLabelEntity>,
  ) {
  }

  public async GetTranslationLabels(
    user: UserEntity,
    projectUuid: string,
    translationUuid: string,
  ): Promise<GetLabelsResponse> {
    const project = await this.projectRepository.findOne({ where: { uuid: projectUuid }, relations: ['translations'] });
    const translation = await this.translationRepository.findOne({ where: { uuid: translationUuid, projectId: project.id } });

    if (!project) {
      const message = `Project with id "${projectUuid}" not found.`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }
    if (!translation) {
      const message = `Translation with id "${translationUuid}" not found.`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    const sharedLabels = await this.translationSharedLabelRepository.find({ where: { projectUuid, translationUuid } });
    const labelsIdsArr = await sharedLabels.map((sharedLabel) => sharedLabel.labelId);
    return new GetLabelsResponse(await this.labelRepository.findByIds(labelsIdsArr));
  }

  public async AddLabelsToTranslation(
    user: UserEntity,
    projectUuid: string,
    translationUuid: string,
    labelsUuids: string,
  ): Promise<any> {
    const project = await this.projectRepository.findOne({ where: { uuid: projectUuid }, relations: ['translations'] });
    const translation = await this.translationRepository.findOne({ where: { uuid: translationUuid, projectId: project.id } });
    const labelsRelatedToProject = await this.labelRepository.find({ where: { projectUuid } });

    if (!project) {
      const message: string = `Project with id "${projectUuid}" not found.`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    if (!translation) {
      const message: string = `Translation with id "${translationUuid}" not found.`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    const possibleLabelsToAdd = await labelsRelatedToProject.reduce((acc: any[], label: LabelEntity) => {
      labelsUuids.split(',').forEach((labelUuid: string) => {
        if (label.uuid === labelUuid) {
          const translationLabel = new TranslationLabelEntity();
          translationLabel.translationUuid = translationUuid;
          translationLabel.translationId = translation.id;
          translationLabel.labelUuid = labelUuid;
          translationLabel.labelId = label.id;
          translationLabel.projectUuid = projectUuid;
          acc.push(translationLabel);
        }
      });
      return acc;
    }, []);

    try {
      const translationLabel = (await this.translationSharedLabelRepository.find({ where: { projectUuid, translationUuid } }));
      await this.translationSharedLabelRepository.remove(translationLabel);
      await this.translationSharedLabelRepository.save(possibleLabelsToAdd);
      const possibleLabelsToAddIds = possibleLabelsToAdd.map((l) => l.labelId);
      return await this.labelRepository.findByIds(possibleLabelsToAddIds);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
