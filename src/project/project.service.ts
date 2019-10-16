import { Injectable, InternalServerErrorException, Logger, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { GetProjectsFilterDTO } from './dto/get-projects-filter.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  private logger = new Logger('ProjectService');

  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
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
    const { title, description, defaultLocale } = createProjectDTO;
    project.title = title;
    project.description = description;
    project.defaultLocale = defaultLocale;
    project.user = user;

    try {
      await project.save();
    } catch (error) {
      this.logger.error(`Failed to create project for user "${user.username}". Data: ${JSON.stringify(createProjectDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }

    delete project.user;
    return project;
  }

  async updateProject(
    @Param('id') id: number,
    createProjectDTO,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    let project = await this.projectRepository.findOne({ where: { id, userId: user.id } });
    if (!project) {
      this.logger.error(`Project with id "${id}" not found.`);
      throw new NotFoundException(`Project with id "${id}" not found.`);
    }
    await this.projectRepository.update({ id }, createProjectDTO);
    project = await this.projectRepository.findOne({ where: { id, userId: user.id } });
    return project;
  }

  async deleteProject(
    id: number,
    user: UserEntity,
  ): Promise<void> {
    const result = await this.projectRepository.delete({ id, userId: user.id });

    if (result.affected === 0) {
      this.logger.error(`Project with id "${id}" not found`);
      throw new NotFoundException(`Project with id "${id}" not found.`);
    }
  }
}
