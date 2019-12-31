import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// app imports
import { TranslationService } from './translation.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { TranslationRO } from './dto/translation-ro';

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
    @Param('id') projectId: string,
  ): Promise<TranslationRO[]> {
    this.logger.verbose(`User "${user.email}" is retrieving his translations.`);
    return this.translationItemService.getTranslationsByProject(projectId, user);
  }

  @Post('translations')
  @UsePipes(ValidationPipe)
  createTranslation(
    @Body() createTranslationDTO: CreateTranslationDTO,
    @Param('id') projectId: number,
    @GetUser() user: UserEntity,
  ): Promise<TranslationRO[]> {
    this.logger.verbose(`User "${user.email}" is creating a new translation. Data: ${JSON.stringify(createTranslationDTO)}.`);
    return this.translationItemService.createTranslation(createTranslationDTO, user, projectId);
  }

  @Put('translations/:translationId')
  @UsePipes(ValidationPipe)
  updateTranslation(
    @Body() updateTranslationDTO: CreateTranslationDTO,
    @Param('id') projectId: number,
    @Param('translationId') translationId: number,
    @GetUser() user: UserEntity,
  ): Promise<TranslationRO[]> {
    this.logger.verbose(`User "${user.email}" is updating translation. Data: ${JSON.stringify(updateTranslationDTO)}.`);
    return this.translationItemService.updateTranslation(updateTranslationDTO, user, projectId, translationId);
  }

  @Delete('translations/:translationId')
  @UsePipes(ValidationPipe)
  deleteTranslation(
    @Param('id') projectId: number,
    @Param('translationId') translationId: number,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    return this.translationItemService.deleteTranslation(projectId, translationId, user);
  }
}
