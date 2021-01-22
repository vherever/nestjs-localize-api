import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
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
import { LocaleToAddRemoveDTO } from './dto/locale-add-remove.dto';
import { UpdateProjectDTO } from './dto/update-project.dto';

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
      return Object.assign({
        sharedUsers:  await this.getSharedUsers(p.project.shares, user.id),
        translationsCount: await this.getTranslationsCount(p, 'projectId'),
        availableTranslationLocales: p.availableTranslationLocales,
        isShared: true,
      }, new GetProjectResponse(p.project, p.role));
    });

    const projectsAndUsersBelongsToProject = await projects.map(async (p: ProjectEntity) => {
      return Object.assign({
        sharedUsers: await this.getSharedUsers(p.shares, user.id),
        translationsCount: await this.getTranslationsCount(p, 'id'),
      }, new GetProjectResponse(p, RoleEnum.ADMINISTRATOR));
    });

    // TODO: filter manually by needed column
    const projectsAll = await Promise.all([...await projectsAndUsersBelongsToProject, ...await sharedProjectsAndUsersBelongsToShared]);
    const projectsAllFiltered = await this.sortData(projectsAll, 'updated_desc');

    try {
      return projectsAllFiltered;
    } catch (error) {
      this.logger.error(`Failed to get projects for user "${user.email}", DTO: ${JSON.stringify(filterDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getProjectById(
    projectUuid: string,
    user: UserEntity,
  ): Promise<GetProjectResponse> {
    const project = await this.projectRepository
      .findOne({ where: { uuid: projectUuid, userId: user.id }, relations: ['shares', 'labels'] });

    const shared = await SharedProjectEntity
      .findOne({ where: { projectUuid, targetId: user.id }, relations: ['project'] });

    if (!project && !shared) {
      throw new NotFoundException(`Project with ID "${projectUuid}" not found.`);
    }

    let projectsAndUsersBelongsToProject;

    if (shared) {
      const projectShared = await this.projectRepository
        .findOne({ where: { id: shared.projectId }, relations: ['shares'] });

      projectsAndUsersBelongsToProject = await Object.assign({
        sharedUsers: await this.getSharedUsers(projectShared.shares, user.id),
        availableTranslationLocales: shared.availableTranslationLocales,
        isShared: true,
      }, new GetProjectResponse(projectShared, shared.role));
    }

    if (project) {
      projectsAndUsersBelongsToProject = await Object.assign({
        sharedUsers: await this.getSharedUsers(project.shares, user.id),
        availableTranslationLocales: project.translationsLocales || '',
      }, new GetProjectResponse(project, RoleEnum.ADMINISTRATOR));
    }

    return await projectsAndUsersBelongsToProject;
  }

  async createProject(
    createProjectDTO: CreateProjectDTO,
    user: UserEntity,
  ): Promise<GetProjectResponse> {
    const project = new ProjectEntity();
    const { title, description, defaultLocale } = createProjectDTO;
    project.title = title;
    project.description = description;
    project.defaultLocale = defaultLocale;
    project.translationsLocales = defaultLocale;
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

  async updateTranslationLocalesAddLocale(
    projectUuid: string,
    translationLocaleDTO: Partial<LocaleToAddRemoveDTO>,
    user: UserEntity,
  ): Promise<any> {
    let project: ProjectEntity = await this.findProject(projectUuid, user);
    if (!project) {
      this.logger.error(`Project with id: "${projectUuid}" not found.`);
      throw new NotFoundException(`Project with id: "${projectUuid}" not found.`);
    }
    const projectLocalesArr: string[] = this.getProjectLocalesArray(project.translationsLocales);

    const localeToAdd = translationLocaleDTO.locale;

    if (!this.isLocaleAlreadyExists(projectLocalesArr, project.defaultLocale, localeToAdd)) {
      try {
        const locales: string = this.addLocaleToProjectLocales(projectLocalesArr, localeToAdd);
        await this.projectRepository.update({ uuid: projectUuid }, { translationsLocales : locales });
      } catch (error) {
        this.logger.error(`Failed to update project for user "${user.email}", projectId: "${project.id}". Data: ${JSON.stringify(translationLocaleDTO)}.`, error.stack);
        throw new InternalServerErrorException();
      }
      project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id } });
      return new GetProjectResponse(project, RoleEnum.ADMINISTRATOR);
    } else {
      this.logger.error(`The locale '${localeToAdd}' already exists`);
      throw new ConflictException(`The locale '${localeToAdd}' already exists`);
    }
  }

  async updateTranslationLocalesRemoveLocale(
    projectUuid: string,
    translationLocaleDTO: Partial<LocaleToAddRemoveDTO>,
    user: UserEntity,
  ): Promise<any> {
    let project: ProjectEntity = await this.findProject(projectUuid, user);
    if (!project) {
      this.logger.error(`Project with id: "${projectUuid}" not found.`);
      throw new NotFoundException(`Project with id: "${projectUuid}" not found.`);
    }
    const projectLocalesArr: string[] = this.getProjectLocalesArray(project.translationsLocales);

    const localeToRemove = translationLocaleDTO.locale;

    if (this.isLocaleAlreadyExists(projectLocalesArr, project.defaultLocale, localeToRemove)) {
      try {
        const locales = this.removeLocaleFromProjectLocales(projectLocalesArr, localeToRemove);
        await this.projectRepository.update({ uuid: projectUuid }, { translationsLocales : locales });
      } catch (error) {
        this.logger.error(`Failed to update project for user "${user.email}", projectId: "${project.id}". Data: ${JSON.stringify(translationLocaleDTO)}.`, error.stack);
        throw new InternalServerErrorException();
      }
      project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id } });
      return new GetProjectResponse(project, RoleEnum.ADMINISTRATOR);
    } else {
      this.logger.error(`The locale '${localeToRemove}' is not exists in current project.`);
      throw new NotFoundException(`The locale '${localeToRemove}' is not exists in current project.`);
    }
  }

  async updateProject(
    projectUuid: string,
    updateProjectDTO: Partial<UpdateProjectDTO>,
    user: UserEntity,
  ): Promise<GetProjectResponse> {
    let project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id } });
    const shared: SharedProjectEntity = await SharedProjectEntity.findOne({ where: { senderId: user.id, projectUuid }, relations: ['project', 'project.shares'] });
    if (!project) {
      this.logger.error(`Project with id: "${projectUuid}" not found.`);
      throw new NotFoundException(`Project with id: "${projectUuid}" not found.`);
    }
    try {
      if (shared) {
        await SharedProjectEntity.update(
          { senderId: user.id, projectUuid },
          { availableTranslationLocales: this.getUpdatedAvailableTranslationLocales(shared.availableTranslationLocales, updateProjectDTO.defaultLocale) },
          );
      }
      // updateProjectDTO.translationsLocales = this.getTranslationLocales(project.defaultLocale, updateProjectDTO.defaultLocale, project.translationsLocales);
      await this.projectRepository.update({ uuid: projectUuid }, updateProjectDTO);
    } catch (error) {
      this.logger.error(`Failed to update project for user "${user.email}", projectId: "${project.id}". Data: ${JSON.stringify(updateProjectDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }
    project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id } });
    return new GetProjectResponse(project, RoleEnum.ADMINISTRATOR);
  }

  async deleteProject(
    uuid: string,
    user: UserEntity,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { uuid, userId: user.id } });

    if (!project) {
      this.logger.error(`Project with id: "${uuid}" not found`);
      throw new NotFoundException(`Project with id: "${uuid}" not found.`);
    }

    try {
      await this.projectRepository.delete({ uuid });
    } catch (error) {
      this.logger.error(`Failed to delete project with projectId: "${uuid}".`, error.stack);
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
          u.availableTranslationLocales = sh.availableTranslationLocales;
          return u;
        }
      });
    });

    return await usersFormatted;
  }

  private async getTranslationsCount(p: ProjectEntity | SharedProjectEntity, key: string): Promise<number> {
    return await TranslationEntity.count({where: { projectId: p[key] }});
  }

  private async findProject(projectUuid: string, user: UserEntity, shares: any = []): Promise<ProjectEntity> {
    return await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id }, relations: shares });
  }

  private getProjectLocalesArray(projectLocalesString: string): string[] {
    return projectLocalesString ? projectLocalesString
      .replace(/\s/g, '')
      .split(',') : [];
  }

  private addLocaleToProjectLocales(projectLocalesArr: string[], localeToAdd: string): string {
    projectLocalesArr.push(localeToAdd);
    return projectLocalesArr.join(',');
  }

  private removeLocaleFromProjectLocales(projectLocalesArr: string[], localeToRemove: string): string {
    const localeToRemoveIndex = projectLocalesArr.indexOf(localeToRemove);
    if (localeToRemoveIndex > -1) {
      projectLocalesArr.splice(localeToRemoveIndex, 1);
    }
    return projectLocalesArr.join(',');
  }

  private isLocaleAlreadyExists(localesArr: string[], defaultLocale: string, locale: string): boolean {
    return !!localesArr.reduce((acc: string, curr: string) => {
      if (curr === locale) {
        acc = curr;
      }
      return acc;
    }, null) || defaultLocale === locale;
  }

  private getTranslationLocales(oldDefaultLocale: string, newDefaultLocale: string, translationsLocales: string): any {
    const locales = translationsLocales.split(',');
    const index = locales.indexOf(newDefaultLocale);
    if (index > -1) {
      locales[index] = oldDefaultLocale;
    }
    return locales.join(',');
  }

  private getUpdatedAvailableTranslationLocales(translationsLocales: string, defaultLocale: string): string {
    const splitted: string[] = translationsLocales.replace(/\s/g, '').split(',');
    const elementIndex = splitted.indexOf(defaultLocale);
    if (elementIndex > -1) {
      splitted.splice(elementIndex, 1);
      splitted.unshift(defaultLocale);
    }
    return splitted.join(',');
  }
}
