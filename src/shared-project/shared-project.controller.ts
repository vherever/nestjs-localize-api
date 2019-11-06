import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { SharedProjectService } from './shared-project.service';
import { ShareProjectDTO } from './dto/share-project.dto';

@Controller('invite')
@UseGuards(AuthGuard())
export class SharedProjectController {
  private logger = new Logger('SharedProjectController');

  constructor(private sharedProjectService: SharedProjectService) {
  }

  // Share project
  @Post()
  inviteUserToProject(
    @Body() shareProjectDTO: ShareProjectDTO,
    @GetUser() user: UserEntity,
  ): Promise<any> {
    this.logger.verbose(`The user "${user.id}" inviting the user "${shareProjectDTO.targetId}" a project with id "${shareProjectDTO.projectId}"`);
    return this.sharedProjectService.inviteUserToProject(shareProjectDTO, user);
  }
}
