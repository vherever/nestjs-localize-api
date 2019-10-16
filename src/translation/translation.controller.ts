import { Body, Controller, Get, Logger, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TranslationService } from './translation.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { CreateTranslationDTO } from './dto/create-translation.dto';
import { TranslationEntity } from './translation.entity';

@Controller('translations')
@UseGuards(AuthGuard())
export class TranslationController {
  private logger = new Logger('TranslationItemController');

  constructor(private translationItemService: TranslationService) {
  }

  @Get('project/:id')
  getTranslationsByProject(
    @GetUser() user: UserEntity,
    @Param('id') projectId: string,
  ) {
    this.logger.verbose(`User "${user.username}" retrieving all translations.`);
    return this.translationItemService.getTranslationsByProject(projectId);
  }

  @Post('project/:id')
  @UsePipes(ValidationPipe)
  createTranslation(
    @Body() createTranslationDTO: CreateTranslationDTO,
    @Param('id') projectId: string,
    @GetUser() user: UserEntity,
  ): Promise<TranslationEntity> {
    this.logger.verbose(`User "${user.username}" creating a new translation.`);
    return this.translationItemService.createTranslation(createTranslationDTO, user, projectId);
  }
}
