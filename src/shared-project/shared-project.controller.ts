import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
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
  inviteUserToProject(
    @Body() shareProjectDTO: ShareProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<SharedProjectEntity> {
    this.logger.verbose(`The user "${user.id}" inviting the user "${shareProjectDTO.targetId}" a project with id "${shareProjectDTO.projectId}"`);
    return this.sharedProjectService.inviteUserToProject(shareProjectDTO, user);
  }

  @Post('/remove')
  excludeUserFromProject(
    @Body() shareProjectDTO: ShareProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    this.logger.verbose(`The user "${user.id} excluding the user ${shareProjectDTO.targetId}" from the project with id "${shareProjectDTO.projectId}"`);
    return this.sharedProjectService.excludeUserFromProject(shareProjectDTO);
  }
}
