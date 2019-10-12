import { Injectable, NotFoundException } from '@nestjs/common';
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
    const found = await this.projectRepository.findOne({ where: { id, userId: user.id } });

    if (!found) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return found;
  }

  async createProject(
    createProjectDTO,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    return this.projectRepository.createProject(createProjectDTO, user);
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
