import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { SharedProjectEntity } from './shared-project.entity';
import { ProjectEntity } from '../project/project.entity';
import { ShareProjectDTO } from './dto/share-project.dto';

@Injectable()
export class SharedProjectService {
  private logger = new Logger('SharedProjectService');

  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async inviteUserToProject(
    shareProjectDTO: ShareProjectDTO,
    user: UserEntity,
  ): Promise<any> {
    const project = await this.projectRepository.findOne({ where: { id: shareProjectDTO.projectId, userId: user.id } });

    const targetUser = await this.userRepository.findOne({ where: { id: shareProjectDTO.targetId } });

    if (!targetUser) {
      this.logger.error(`User with id: "${shareProjectDTO.targetId}" not found`);
      throw new NotFoundException(`User with id: "${shareProjectDTO.targetId}" not found.`);
    }

    if (targetUser.id === user.id) {
      this.logger.error(`You can not share the project with yourself.`);
      throw new NotFoundException(`You can not share the project with yourself.`);
    }

    if (!project) {
      this.logger.error(`Project with id: "${shareProjectDTO.projectId}" not found`);
      throw new NotFoundException(`Project with id: "${shareProjectDTO.projectId}" not found.`);
    }

    const sharedProject = new SharedProjectEntity();
    sharedProject.senderId = user.id;
    sharedProject.targetId = shareProjectDTO.targetId;
    sharedProject.projectId = shareProjectDTO.projectId;

    let shared;

    try {
      await sharedProject.save();
      shared = await SharedProjectEntity.find({ where: { targetId: targetUser.id }, relations: ['project'] });
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`You already shared this project with this user.`);
        throw new ConflictException(`You already shared this project with this user.`);
      }
      this.logger.error(`Failed to create shared project for user: "${user.username}".`, error.stack);
      throw new InternalServerErrorException();
    }
    return shared;
  }
}
