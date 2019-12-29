import { Body, Controller, Get, Logger, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { SharedProjectService } from './shared-project.service';
import { ShareProjectDTO } from './dto/share-project.dto';
import { SharedProjectEntity } from './shared-project.entity';

@Controller('invite')
@UseGuards(AuthGuard())
export class SharedProjectController {
  private logger = new Logger('SharedProjectController');

  constructor(private sharedProjectService: SharedProjectService) {
  }

  // Share project
  @Post('/add')
  @UsePipes(ValidationPipe)
  generateInviteLink(
    @Body() shareProjectDTO: ShareProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<string> {
    const { targetEmail, projectId } = shareProjectDTO;
    this.logger.verbose(`The user "${user.email}" sending to the user "${targetEmail}" the project invite with projectId "${projectId}".`);
    return this.sharedProjectService.generateInvitationLink(shareProjectDTO, user);
  }

  @Get('/:token')
  inviteUserToProject(
    @Param('token') token: string,
  ): Promise<SharedProjectEntity> {
    this.logger.verbose(`Invitation token has been processed.`);
    return this.sharedProjectService.processingInvitationToken(token);
  }

  @Post('/remove')
  excludeUserFromProject(
    @Body() shareProjectDTO: ShareProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    this.logger.verbose(`The user "${user.id} excluding the user ${shareProjectDTO.targetEmail}" from the project with id "${shareProjectDTO.projectId}"`);
    return this.sharedProjectService.excludeUserFromProject(shareProjectDTO);
  }
}
