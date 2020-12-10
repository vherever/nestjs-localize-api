import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// app imports
import { TranslationService } from './translation.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { TranslationRO } from './dto/translation-ro';
import { UpdateTranslationDTO } from './dto/update-translation-settings.dto';

@Controller('projects/:id')
@UseGuards(AuthGuard())
export class TranslationController {
  private logger = new Logger('TranslationItemController');

  constructor(private translationItemService: TranslationService) {
  }

  @Get('translationsAll')
  getAllTranslationsByProject(
    @GetUser() user: UserEntity,
    @Param('id') projectId: string,
  ): Promise<TranslationRO[]> {
    this.logger.verbose(`User "${user.email}" is retrieving all translations.`);
    return this.translationItemService.getAllTranslationsByProject(projectId, user);
  }

  @Get('translations')
  getTranslationsByProject(
    @GetUser() user: UserEntity,
    @Param('id') projectUuid: string,
  ): Promise<TranslationRO[]> {
    this.logger.verbose(`User "${user.email}" is retrieving his translations.`);
    return this.translationItemService.getTranslationsByProject(projectUuid, user);
  }

  @Post('translations')
  @UsePipes(ValidationPipe)
  createTranslation(
    @Body() createTranslationDTO: CreateTranslationDTO,
    @Param('id') projectUuid: string,
    @GetUser() user: UserEntity,
  ): Promise<TranslationRO[]> {
    this.logger.verbose(`User "${user.email}" is creating a new translation. Data: ${JSON.stringify(createTranslationDTO)}.`);
    return this.translationItemService.createTranslation(createTranslationDTO, user, projectUuid);
  }

  @Put('translations/:translationId')
  @UsePipes(ValidationPipe)
  updateTranslation(
    @Body() updateTranslationDTO: UpdateTranslationDTO,
    @Query() query: { isAssetSettings: boolean },
    @Param('id') projectUuid: string,
    @Param('translationId') translationUuid: string,
    @GetUser() user: UserEntity,
  ): Promise<TranslationRO[]> {
    this.logger.verbose(`User "${user.email}" is updating translation. Data: ${JSON.stringify(updateTranslationDTO)}.`);
    return this.translationItemService.updateTranslation(updateTranslationDTO, JSON.parse(query.isAssetSettings.toString()), user, projectUuid, translationUuid);
  }

  @Delete('translations/:translationId')
  @UsePipes(ValidationPipe)
  deleteTranslation(
    @Param('id') projectUuid: string,
    @Param('translationId') translationUuid: string,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    return this.translationItemService.deleteTranslation(projectUuid, translationUuid, user);
  }
}
