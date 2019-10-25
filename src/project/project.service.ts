import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { GetProjectsFilterDTO } from './dto/get-projects-filter.dto';
import { Repository } from 'typeorm';
import { CreateProjectDTO } from './dto/create-project.dto';
import { RoleEnum } from '../shared/enums/role.enum';
import { SharedProjectEntity } from './shared-project.entity';

@Injectable()
export class ProjectService {
  private logger = new Logger('ProjectService');

  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
  }

  async getProjects(
    filterDTO: GetProjectsFilterDTO,
    user: UserEntity,
  ): Promise<ProjectEntity[]> {
    const { search } = filterDTO;
    const query = this.projectRepository.createQueryBuilder('project');

    query.where('project.userId = :userId', { userId: user.id });

    if (search) {
      query.andWhere('(project.title LIKE :search OR project.description LIKE :search)', { search: `%${search}%` });
    }

    try {
      return await query.getMany();
    } catch (error) {
      this.logger.error(`Failed to get projects for user "${user.username}", DTO: ${JSON.stringify(filterDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getProjectById(
    id: number,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOne({ where: { id, userId: user.id } });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    return project;
  }

  async createProject(
    createProjectDTO,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    const project = new ProjectEntity();
    const { created, updated, title, description, defaultLocale, translationsLocales } = createProjectDTO;
    project.created = created;
    project.updated = updated;
    project.title = title;
    project.description = description;
    project.defaultLocale = defaultLocale;
    project.translationsLocales = translationsLocales;
    project.user = user;
    project.ownerId = user.id;

    try {
      await project.save();
    } catch (error) {
      this.logger.error(`Failed to create project for user: "${user.username}". Data: ${JSON.stringify(createProjectDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }

    delete project.user;
    return project;
  }

  async updateProject(
    id: number,
    updateProjectDTO: Partial<CreateProjectDTO>,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    let project = await this.projectRepository.findOne({ where: { id, userId: user.id } });
    if (!project) {
      this.logger.error(`Project with id: "${id}" not found.`);
      throw new NotFoundException(`Project with id: "${id}" not found.`);
    }
    try {
      await this.projectRepository.update({ id }, updateProjectDTO);
    } catch (error) {
      this.logger.error(`Failed to update project for user "${user.username}", projectId: "${project.id}". Data: ${JSON.stringify(updateProjectDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
    project = await this.projectRepository.findOne({ where: { id, userId: user.id } });
    return project;
  }

  async deleteProject(
    id: number,
    user: UserEntity,
  ): Promise<void> {
    const result = await this.projectRepository.delete({ id});

    if (result.affected === 0) {
      this.logger.error(`Project with id: "${id}" not found`);
      throw new NotFoundException(`Project with id: "${id}" not found.`);
    }
  }

  async inviteUserToProject(
    projectId: number,
    userIdToInvite: number,
    user: UserEntity,
  ): Promise<any> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });

    const targetUser = await this.userRepository.findOne({ where: { id: userIdToInvite } });

    if (!targetUser) {
      this.logger.error(`User with id: "${userIdToInvite}" not found`);
      throw new NotFoundException(`User with id: "${userIdToInvite}" not found.`);
    }

    if (targetUser.id === user.id) {
      this.logger.error(`You can not share the project with yourself.`);
      throw new NotFoundException(`You can not share the project with yourself.`);
    }

    if (!project) {
      this.logger.error(`Project with id: "${projectId}" not found`);
      throw new NotFoundException(`Project with id: "${projectId}" not found.`);
    }

    const sharedProject = new SharedProjectEntity();
    sharedProject.senderId = user.id;
    sharedProject.targetId = userIdToInvite;
    sharedProject.projectId = projectId;

    let shared;

    try {
      await sharedProject.save();
      shared = await SharedProjectEntity.find({ where: { targetId: targetUser.id }, relations: ['project'] })
    } catch (error) {
      this.logger.error(`Failed to create shared project for user: "${user.username}".`, error.stack);
      throw new InternalServerErrorException();
    }
    return shared;
  }
}
