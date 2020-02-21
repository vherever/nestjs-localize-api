import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// app imports
import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { GetProjectsFilterDTO } from './dto/get-projects-filter.dto';
import { CreateProjectDTO } from './dto/create-project.dto';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';
import { GetProjectResponse } from './dto/get-project-response';
import { RoleEnum } from '../shared/enums/role.enum';
import { GetUserResponse } from '../user/dto/get-user-response';
import { TranslationEntity } from '../translation-item/translation.entity';
import { SortingHelper } from '../shared/sorting-helper';

@Injectable()
export class ProjectService extends SortingHelper {
  private logger = new Logger('ProjectService');

  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,

    @InjectRepository(SharedProjectEntity)
    private sharedProjectRepository: Repository<SharedProjectEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(TranslationEntity)
    private translationRepository: Repository<TranslationEntity>,
  ) {
    super();
  }

  async getProjects(
    filterDTO: GetProjectsFilterDTO,
    user: UserEntity,
  ): Promise<GetProjectResponse[]> {
    const { search } = filterDTO;
    // const query = this.projectRepository.createQueryBuilder('project');
    // query.where('project.userId = :userId', { userId: user.id });

    const projects = await this.projectRepository.find({ where: { userId: user.id }, relations: ['user', 'shares'] });

    const shared = await SharedProjectEntity.find({ where: { targetId: user.id }, relations: ['project', 'project.shares'] });

    const sharedProjectsAndUsersBelongsToShared = await shared.map(async (p: SharedProjectEntity) => {
      const d = Object.assign({
        sharedUsers:  await this.getSharedUsers(p.project.shares, user.id),
        translationsCount: await this.getTranslationsCount(p, 'projectId'),
      }, new GetProjectResponse(p.project, p.role));
      d.availableTranslationLocales = p.availableTranslationLocales;
      return d;
    });

    const projectsAndUsersBelongsToProject = await projects.map(async (p: ProjectEntity) => {
      return Object.assign({
        sharedUsers: await this.getSharedUsers(p.shares, user.id),
        translationsCount: await this.getTranslationsCount(p, 'id'),
      }, new GetProjectResponse(p, RoleEnum.ADMINISTRATOR));
    });

    // TODO: filter manually by needed column
    const projectsAll = await Promise.all([...await projectsAndUsersBelongsToProject, ...await sharedProjectsAndUsersBelongsToShared]);
    const projectsAllFiltered = await this.sortData(await projectsAll, 'updated_desc');

    try {
      return await projectsAllFiltered;
    } catch (error) {
      this.logger.error(`Failed to get projects for user "${user.email}", DTO: ${JSON.stringify(filterDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getProjectById(
    id: number,
    user: UserEntity,
  ): Promise<GetProjectResponse> {
    const project = await this.projectRepository.findOne({ where: { id, userId: user.id }, relations: ['shares'] });
    const shared = await SharedProjectEntity.findOne({ where: { projectId: id, targetId: user.id }, relations: ['project'] });

    if (!project && !shared) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    let projectsAndUsersBelongsToProject;

    if (shared) {
      const projectShared = await this.projectRepository.findOne({ where: { id: shared.projectId }, relations: ['shares'] });
      projectsAndUsersBelongsToProject = await Object.assign({sharedUsers: await this.getSharedUsers(projectShared.shares, user.id), availableTranslationLocales: shared.availableTranslationLocales}, new GetProjectResponse(projectShared, shared.role));
    }

    if (project) {
      projectsAndUsersBelongsToProject = await Object.assign({sharedUsers: await this.getSharedUsers(project.shares, user.id)}, new GetProjectResponse(project, RoleEnum.ADMINISTRATOR));
    }

    return await projectsAndUsersBelongsToProject;
  }

  async createProject(
    createProjectDTO: CreateProjectDTO,
    user: UserEntity,
  ): Promise<GetProjectResponse> {
    const project = new ProjectEntity();
    const { title, description, defaultLocale, translationsLocales } = createProjectDTO;
    project.title = title;
    project.description = description;
    project.defaultLocale = defaultLocale;
    project.translationsLocales = translationsLocales;
    project.user = user;
    project.ownerId = user.id;

    try {
      await project.save();
    } catch (error) {
      this.logger.error(`Failed to create project for user: "${user.email}". Data: ${JSON.stringify(createProjectDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }

    delete project.user;
    return new GetProjectResponse(project, RoleEnum.ADMINISTRATOR);
  }

  async updateProject(
    id: number,
    updateProjectDTO: Partial<CreateProjectDTO>,
    user: UserEntity,
  ): Promise<GetProjectResponse> {
    let project = await this.projectRepository.findOne({ where: { id, userId: user.id } });
    if (!project) {
      this.logger.error(`Project with id: "${id}" not found.`);
      throw new NotFoundException(`Project with id: "${id}" not found.`);
    }
    try {
      await this.projectRepository.update({ id }, updateProjectDTO);
    } catch (error) {
      this.logger.error(`Failed to update project for user "${user.email}", projectId: "${project.id}". Data: ${JSON.stringify(updateProjectDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
    project = await this.projectRepository.findOne({ where: { id, userId: user.id } });
    return new GetProjectResponse(project, RoleEnum.ADMINISTRATOR);
  }

  async deleteProject(
    id: number,
    user: UserEntity,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id, userId: user.id } });

    if (!project) {
      this.logger.error(`Project with id: "${id}" not found`);
      throw new NotFoundException(`Project with id: "${id}" not found.`);
    }

    try {
      await this.projectRepository.delete({ id });
    } catch (error) {
      this.logger.error(`Failed to delete project with projectId: "${id}".`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  private async getSharedUsers(shares: SharedProjectEntity[], userId?: number): Promise<GetUserResponse[]> {
    const sharedUsersArr = await shares.reduce(async (accPromise, sh: SharedProjectEntity) => {
      const acc = await accPromise;
      return acc.concat(sh);
    }, Promise.resolve([]));

    const sharedUsersIdsArr = await sharedUsersArr.map((sh: SharedProjectEntity) => sh.targetId).filter((n) => n !== userId);
    const sharedById = await sharedUsersArr
      .map((sh: SharedProjectEntity) => sh.senderId)
      .filter((value, index, self) => {
        return self.indexOf(value) === index && value !== userId;
      });

    const sharedAll = await sharedUsersIdsArr.concat(sharedById);

    const foundUsers = await this.userRepository.findByIds(await sharedAll);

    const usersFormatted = await foundUsers.map((u: UserEntity) => new GetUserResponse(u));

    usersFormatted.map((u: GetUserResponse) => {
      return sharedUsersArr.map((sh: SharedProjectEntity) => {
        if (u.id === sharedById[0]) {
          u.role = RoleEnum.ADMINISTRATOR;
        }
        if (u.id === sh.targetId) {
          u.role = sh.role;
          return u;
        }
      });
    });

    return await usersFormatted;
  }

  private async getTranslationsCount(p: ProjectEntity | SharedProjectEntity, key: string): Promise<number> {
    return await TranslationEntity.count({where: { projectId: p[key] }});
  }
}
