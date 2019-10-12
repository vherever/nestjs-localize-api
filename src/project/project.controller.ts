import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ProjectService } from './project.service';
import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { CreateProjectDTO } from './dto/create-project.dto';
import { GetProjectsFilterDTO } from './dto/get-projects-filter.dto';

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
  ) {
    this.logger.verbose(`User "${user.username}" retrieving all projects. Filter: ${JSON.stringify(filterDTO)}`);
    return this.projectsService.getProjects(filterDTO, user);
  }

  @Get('/:id')
  getProjectById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: UserEntity,
  ): Promise<ProjectEntity> {
    return this.projectsService.getProjectById(id, user);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createProject(
    @Body() createProjectDTO: CreateProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<ProjectEntity> {
    this.logger.verbose(`User "${user.username}" creating a new project. Data: ${JSON.stringify(createProjectDTO)}`);
    return this.projectsService.createProject(createProjectDTO, user);
  }

  @Delete('/:id')
  deleteProject(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    return this.projectsService.deleteProject(id, user);
  }
}
