import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LabelService } from './label.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { CreateLabelDTO } from './dto/create-label.dto';

@Controller('projects/:id/labels')
@UseGuards(AuthGuard())
export class LabelController {
  private logger = new Logger('LabelController');

  constructor(
    private readonly labelService: LabelService,
  ) {
  }

  @Get()
  getProjectLabels(
    @GetUser() user: UserEntity,
    @Param('id') projectUuid: string,
  ): Promise<any> {
    this.logger.verbose(`User "${user.email}" is getting a list of labels for the project: ${projectUuid}.`);
    return this.labelService.getProjectLabels(user, projectUuid);
  }

  @Post()
  createProjectLabel(
    @GetUser() user: UserEntity,
    @Param('id') projectUuid: string,
    @Body() createLabelDTO: CreateLabelDTO,
  ): Promise<any> {
    this.logger.verbose(`User "${user.email}" is creating a new label for the project: ${projectUuid}. Data: ${JSON.stringify(createLabelDTO)}.`);
    return this.labelService.createProjectLabel(user, projectUuid, createLabelDTO);
  }

  @Put(':labelId')
  updateLabel(
    @GetUser() user: UserEntity,
    @Param('id') projectUuid: string,
    @Param('labelId') labelUuid: string,
    @Body() updateLabelDTO: CreateLabelDTO,
  ): Promise<any> {
    this.logger.verbose(`User "${user.email}" is updating a label: ${labelUuid} for the project: ${projectUuid}. Data: ${JSON.stringify(updateLabelDTO)}.`);
    return this.labelService.updateLabel(user, projectUuid, labelUuid, updateLabelDTO);
  }

  @Delete(':labelId')
  removeLabel(
    @GetUser() user: UserEntity,
    @Param('id') projectUuid: string,
    @Param('labelId') labelUuid: string,
  ): Promise<void> {
    return this.labelService.removeLabel(user, projectUuid, labelUuid);
  }
}
