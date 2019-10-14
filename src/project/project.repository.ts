import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';

import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { CreateProjectDTO } from './dto/create-project.dto';
import { GetProjectsFilterDTO } from './dto/get-projects-filter.dto';

@EntityRepository(ProjectEntity)
export class ProjectRepository extends Repository<ProjectEntity> {
  private logger = new Logger('ProjectRepository');

  async getProjects(
    filterDTO: GetProjectsFilterDTO,
    user: UserEntity,
  ): Promise<ProjectEntity[]> {
    const { search } = filterDTO;
    const query = this.createQueryBuilder('project');

    query.where('project.userId = :userId', { userId: user.id });

    if (search) {
      query.andWhere('(project.title LIKE :search OR project.description LIKE :search)', { search: `%${search}%` });
    }

    try {
      const projects = await query.getMany();
      return projects;
    } catch (error) {
      this.logger.error(`Failed to get projects for user "${user.username}", DTO: ${JSON.stringify(filterDTO)}`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async createProject(
    createProjectDTO: CreateProjectDTO,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    const project = new ProjectEntity();

    const { title, description, defaultLocale } = createProjectDTO;
    project.title = title;
    project.description = description;
    project.defaultLocale = defaultLocale;
    project.user = user;

    try {
      await project.save();
    } catch (error) {
      this.logger.error(`Failed to create project for user "${user.username}". Data: ${JSON.stringify(createProjectDTO)}`, error.stack);
      throw new InternalServerErrorException();
    }

    delete project.user;
    return project;
  }
}
