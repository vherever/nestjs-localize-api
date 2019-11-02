import { Body, Controller, Get, Logger, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
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
    return this.sharedProjectService.inviteUserToProject(shareProjectDTO, user);
  }

  // @Get(':/id')
  // getSharedProjects(
  //   @GetUser() user: UserEntity,
  // ): Promise<any> {
  //   this.logger.verbose(`User "${user.username}" is retrieving shared projects.`);
  //   return this.sharedProjectService.getSharedProjects();
  // }
}
