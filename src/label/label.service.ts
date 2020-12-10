import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// app imports
import { LabelEntity } from './label.entity';
import { ProjectEntity } from '../project/project.entity';
import { UserEntity } from '../auth/user.entity';
import { CreateLabelDTO } from './dto/create-label.dto';

@Injectable()
export class LabelService {
  private logger = new Logger('LabelService');

  constructor(
    @InjectRepository(LabelEntity)
    private labelRepository: Repository<LabelEntity>,
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
  ) {
  }

  private getProject(user: UserEntity, projectUuid: string, relations?: string): Promise<ProjectEntity> {
    return this.projectRepository.findOne({
      where: {
        userId: user.id,
        uuid: projectUuid,
      },
      relations: [relations],
    });
  }

  public async getProjectLabels(
    user: UserEntity,
    projectUuid: string,
  ): Promise<LabelEntity[]> {
    const project = await this.getProject(user, projectUuid, 'labels');

    if (!project) {
      this.logger.error(`Project with id "${projectUuid}" not found.`);
      throw new NotFoundException(`Project with id "${projectUuid}" not found.`);
    }

    try {
      return project.labels;
    } catch (error) {
      const message: string = 'Can not load labels.';
      this.logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  public async createProjectLabel(
    user: UserEntity,
    projectUuid: string,
    createLabelDTO: CreateLabelDTO,
  ): Promise<any> {
    const project = await this.getProject(user, projectUuid, 'labels');
    const label: LabelEntity = await this.labelRepository.create({
      project,
      ...createLabelDTO,
    });

    try {
      await this.labelRepository.save(label);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`${error.detail}`);
        throw new ConflictException(`${error.detail}`);
      } else {
        this.logger.error('Can not create translation.');
        throw new InternalServerErrorException();
      }
    }
  }

  public async removeLabel(
    user: UserEntity,
    projectUuid: string,
    labelUuid: string,
  ): Promise<void> {
    const project = await this.getProject(user, projectUuid, 'labels');

    if (!project) {
      const message: string = `Project with id "${projectUuid}" not found.`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    try {
      await this.labelRepository.delete({
        uuid: labelUuid,
      });
    } catch (error) {
      const message: string = `Failed to delete label for the user "${user.email}", projectId: "${projectUuid}".`;
      this.logger.error(message, error.stack);
      throw new InternalServerErrorException(message);
    }
  }
}
