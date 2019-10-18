import { Body, Controller, Get, Logger, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TranslationService } from './translation.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { TranslationEntity } from './translation.entity';

@Controller('projects/:id')
@UseGuards(AuthGuard())
export class TranslationController {
  private logger = new Logger('TranslationItemController');

  constructor(private translationItemService: TranslationService) {
  }

  @Get('translations')
  getTranslationsByProject(
    @GetUser() user: UserEntity,
    @Param('id') projectId: string,
  ) {
    this.logger.verbose(`User "${user.username}" is retrieving all translations.`);
    return this.translationItemService.getTranslationsByProject(projectId, user);
  }

  @Post('translations')
  @UsePipes(ValidationPipe)
  createTranslation(
    @Body() createTranslationDTO: CreateTranslationDTO,
    @Param('id') projectId: number,
    @GetUser() user: UserEntity,
  ): Promise<TranslationEntity> {
    this.logger.verbose(`User "${user.username}" is creating a new translation. Data: ${JSON.stringify(createTranslationDTO)}.`);
    return this.translationItemService.createTranslation(createTranslationDTO, user, projectId);
  }

  @Put('translations/:translationId')
  @UsePipes(ValidationPipe)
  updateTranslation(
    @Body() updateTranslationDTO: CreateTranslationDTO,
    @Param('id') projectId: number,
    @Param('translationId') translationId: number,
    @GetUser() user: UserEntity,
  ): Promise<TranslationEntity> {
    this.logger.verbose(`User "${user.username}" is updating translation. Data: ${JSON.stringify(updateTranslationDTO)}.`);
    return this.translationItemService.updateTranslation(updateTranslationDTO, user, projectId, translationId);
  }
}
