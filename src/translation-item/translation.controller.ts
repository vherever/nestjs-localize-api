import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TranslationService } from './translation.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { TranslationEntity } from './translation.entity';
import { GetTranslationRO } from './dto/get-translation-response';

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
    @Body('defaultLanguage') defaultLanguage: string,
    @Body('languages') languages: string,
  ): Promise<GetTranslationRO[]> {
    this.logger.verbose(`User "${user.username}" is creating a new translation. Data: ${JSON.stringify(createTranslationDTO)}.`);
    return this.translationItemService.createTranslation(createTranslationDTO, user, projectId, defaultLanguage, languages);
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

  @Delete('translations/:translationId')
  @UsePipes(ValidationPipe)
  deleteTranslation(
    @Param('id') projectId: number,
    @Param('translationId') translationId: number,
    @GetUser() user: UserEntity,
  ): any {
    return this.translationItemService.deleteTranslation(projectId, translationId, user);
  }
}
