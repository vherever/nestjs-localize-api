import { Body, Controller, Get, Logger, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { SharedProjectService } from './shared-project.service';
import { ShareProjectDTO } from './dto/share-project.dto';
import { SharedProjectEntity } from './shared-project.entity';
import { ExcludeProjectDTO } from './dto/exclude-project.dto';
import { ManagePermissionsDTO } from './dto/manage-permissions.dto';
import { SharedProjectResponse } from './dto/shared-project-response';

@Controller('invite')
export class SharedProjectController {
  private logger = new Logger('SharedProjectController');

  constructor(private sharedProjectService: SharedProjectService) {
  }

  // Share project
  @Post('/add')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  generateInviteLink(
    @Body() shareProjectDTO: ShareProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<string> {
    const { targetEmail, projectUuid } = shareProjectDTO;
    this.logger.verbose(`The user "${user.email}" sending to the user "${targetEmail}" the project invite with projectId "${projectUuid}".`);
    return this.sharedProjectService.generateInvitationLink(shareProjectDTO, user);
  }

  @Get('/:token')
  inviteUserToProject(
    @Param('token') token: string,
  ): Promise<SharedProjectResponse> {
    this.logger.verbose(`Invitation token has been processed.`);
    return this.sharedProjectService.processingInvitationToken(token);
  }

  @Post('/remove')
  @UseGuards(AuthGuard())
  excludeUserFromProject(
    @Body() excludeProjectDTO: ExcludeProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    this.logger.verbose(`The user "${user.id} excluding the user ${excludeProjectDTO.targetEmail}" from the project with projectUuid "${excludeProjectDTO.projectUuid}"`);
    return this.sharedProjectService.excludeUserFromProject(excludeProjectDTO);
  }

  @Put('/permissions')
  @UseGuards(AuthGuard())
  manageUserPermissions(
    @Body() manageUserPermissionsDTO: ManagePermissionsDTO,
    @GetUser() user: UserEntity,
  ): Promise<any> {
    this.logger.verbose(`The user "${user.email}" managing permission for the user "${manageUserPermissionsDTO.targetUuid}"`);
    return this.sharedProjectService.manageUserPermissions(manageUserPermissionsDTO);
  }
}
