import { Body, Controller, Get, Logger, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// app imports
import { TranslationLabelService } from './translation-label.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';

@Controller('/projects/:projectUuid/translations/:translationUuid/labels')
@UseGuards(AuthGuard())
export class TranslationLabelController {
  private logger = new Logger('TranslationSharedLabelController');

  constructor(
    private translationSharedLabelService: TranslationLabelService,
  ) {
  }

  @Get()
  @UsePipes(ValidationPipe)
  GetTranslationLabels(
    @GetUser() user: UserEntity,
    @Param('projectUuid') projectUuid: string,
    @Param('translationUuid') translationUuid: string,
  ): Promise<any> {
    return this.translationSharedLabelService.GetTranslationLabels(user, projectUuid, translationUuid);
  }

  @Post()
  @UsePipes(ValidationPipe)
  AddLabelsToTranslation(
    @GetUser() user: UserEntity,
    @Param('projectUuid') projectUuid: string,
    @Param('translationUuid') translationUuid: string,
    @Body() body: { labelsIds: string },
  ): Promise<any> {
    return this.translationSharedLabelService.AddLabelsToTranslation(user, projectUuid, translationUuid, body.labelsIds);
  }
}
