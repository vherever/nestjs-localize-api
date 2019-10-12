import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectRepository } from './project.repository';
import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { GetProjectsFilterDTO } from './dto/get-projects-filter.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectRepository)
    private projectRepository: ProjectRepository,
  ) {
  }

  getProjects(
    filterDTO: GetProjectsFilterDTO,
    user: UserEntity,
  ): Promise<ProjectEntity[]> {
    return this.projectRepository.getProjects(filterDTO, user);
  }

  async getProjectById(
    id: number,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOne({ where: { id, userId: user.id } });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return project;
  }

  async createProject(
    createProjectDTO,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    return this.projectRepository.createProject(createProjectDTO, user);
  }

  async updateProject(
    @Param('id') id: number,
    createProjectDTO,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    let project = await this.projectRepository.findOne({ where: { id, userId: user.id } });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
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
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
  }
}
