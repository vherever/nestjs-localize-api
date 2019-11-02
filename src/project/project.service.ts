import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { GetProjectsFilterDTO } from './dto/get-projects-filter.dto';
import { Repository } from 'typeorm';
import { CreateProjectDTO } from './dto/create-project.dto';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';
import { RoleEnum } from '../shared/enums/role.enum';
import { GetSharedProjectResponse } from './dto/get-shared-project-response';

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
  ): Promise<{owned: ProjectEntity[], shared: GetSharedProjectResponse[]}> {
    const { search } = filterDTO;
    const query = this.projectRepository.createQueryBuilder('project');

    query.where('project.userId = :userId', { userId: user.id });

    const shared = await SharedProjectEntity.find({ where: { targetId: user.id }, relations: ['project'] });

    if (search) {
      query.andWhere('(project.title LIKE :search OR project.description LIKE :search)', { search: `%${search}%` });
    }

    try {
      return Promise.all([await query.getMany(), await shared]).then(r => {
        return {
          owned: r[0], // created projects by this user
          shared: r[1], // shared projects with this user
        };
      });
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
    createProjectDTO: CreateProjectDTO,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    const project = new ProjectEntity();
    const { title, description, defaultLocale, translationsLocales } = createProjectDTO;
    project.title = title;
    project.description = description;
    project.defaultLocale = defaultLocale;
    project.translationsLocales = translationsLocales;
    project.user = user;
    project.ownerId = user.id;
    project.role = RoleEnum.ADMINISTRATOR;

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
}
