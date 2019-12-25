import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// app imports
import { ProjectService } from './project.service';
import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { CreateProjectDTO } from './dto/create-project.dto';
import { GetProjectsFilterDTO } from './dto/get-projects-filter.dto';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';

@Controller('projects')
@UseGuards(AuthGuard())
export class ProjectController {
  private logger = new Logger('ProjectsController');

  constructor(private projectsService: ProjectService) {
  }

  @Get()
  getProjects(
    @Query(ValidationPipe) filterDTO: GetProjectsFilterDTO,
    @GetUser() user: UserEntity,
  ): Promise<{owned: ProjectEntity[], shared: SharedProjectEntity[]}> {
    this.logger.verbose(`User "${user.email}" is retrieving all projects. Filter: ${JSON.stringify(filterDTO)}.`);
    return this.projectsService.getProjects(filterDTO, user);
  }

  @Get('/:id')
  getProjectById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: UserEntity,
  ): Promise<ProjectEntity | SharedProjectEntity> {
    this.logger.verbose(`User "${user.email} is getting project by id: ${id}.`);
    return this.projectsService.getProjectById(id, user);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createProject(
    @Body() createProjectDTO: CreateProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<ProjectEntity> {
    this.logger.verbose(`User "${user.email}" is creating a new project. Data: ${JSON.stringify(createProjectDTO)}.`);
    return this.projectsService.createProject(createProjectDTO, user);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDTO: CreateProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<ProjectEntity> {
    this.logger.verbose(`User "${user.email}" is updating a project with id "${id}". Data: ${JSON.stringify(updateProjectDTO)}`);
    return this.projectsService.updateProject(id, updateProjectDTO, user);
  }

  @Delete('/:id')
  deleteProject(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    this.logger.verbose(`User "${user.email}" is deleting a project by id: ${id}.`);
    return this.projectsService.deleteProject(id, user);
  }
}
