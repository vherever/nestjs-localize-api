import { Body, Controller, Get, Logger, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// app imports
import { TranslationLabelService } from './translation-label.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { GetLabelsResponse } from '../label/dto/get-labels-response';

@Controller('/projects/:projectUuid/translations/:translationUuid/labels')
@UseGuards(AuthGuard())
export class TranslationLabelController {
  private logger = new Logger('TranslationLabelController');

  constructor(
    private translationLabelService: TranslationLabelService,
  ) {
  }

  @Get()
  @UsePipes(ValidationPipe)
  GetTranslationLabels(
    @GetUser() user: UserEntity,
    @Param('projectUuid') projectUuid: string,
    @Param('translationUuid') translationUuid: string,
  ): Promise<GetLabelsResponse> {
    return this.translationLabelService.GetTranslationLabels(user, projectUuid, translationUuid);
  }

  @Post()
  @UsePipes(ValidationPipe)
  AddLabelsToTranslation(
    @GetUser() user: UserEntity,
    @Param('projectUuid') projectUuid: string,
    @Param('translationUuid') translationUuid: string,
    @Body() body: { tagsUuids: string },
  ): Promise<any> {
    return this.translationLabelService.AddLabelsToTranslation(user, projectUuid, translationUuid, body.tagsUuids);
  }
}
