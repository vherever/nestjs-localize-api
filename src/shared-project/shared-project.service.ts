import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
// app imports
import { UserEntity } from '../auth/user.entity';
import { SharedProjectEntity } from './shared-project.entity';
import { ProjectEntity } from '../project/project.entity';
import { ShareProjectDTO } from './dto/share-project.dto';
import { InviteTokenPayloadInterface } from './invite-token-payload.interface';
import { ExcludeProjectDTO } from './dto/exclude-project.dto';
import { ManagePermissionsDTO } from './dto/manage-permissions.dto';
import { SharedProjectResponse } from './dto/shared-project-response';

@Injectable()
export class SharedProjectService {
  private logger = new Logger('SharedProjectService');

  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,

    @InjectRepository(SharedProjectEntity)
    private sharedProjectRepository: Repository<SharedProjectEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private readonly jwtService: JwtService,
  ) {}

  async generateInvitationLink(
    shareProjectDTO: ShareProjectDTO,
    user: UserEntity,
  ): Promise<string> {
    const { targetEmail, projectUuid, role } = shareProjectDTO;

    const project = await this.projectRepository.findOne({ where: { uuid: projectUuid, userId: user.id } });

    const targetUser = await this.userRepository.findOne({ where: { email: targetEmail } });

    if (!targetUser) {
      this.logger.error(`User with email: "${targetEmail}" not found`);
      throw new NotFoundException(`User with email: "${targetEmail}" not found.`);
    }

    if (targetUser.id === user.id) {
      this.logger.error(`You can not share the project with yourself.`);
      throw new NotFoundException(`You can not share the project with yourself.`);
    }

    if (!project) {
      this.logger.error(`Project with id: "${project.id}" not found`);
      throw new NotFoundException(`Project with id: "${project.id}" not found.`);
    }

    const tokenPayload: InviteTokenPayloadInterface = {
      senderUuid: user.uuid,
      targetUuid: targetUser.uuid,
      targetEmail,
      projectUuid: project.uuid,
      availableTranslationLocales: project.translationsLocales ? project.defaultLocale + ',' + project.translationsLocales : project.defaultLocale,
      role,
    };

    const shared = await SharedProjectEntity.findOne({ where: { targetId: targetUser.id, projectId: project.id }, relations: ['project'] });

    if (shared) {
      this.logger.error(`You already shared this project with this user.`);
      throw new ConflictException(`You already shared this project with this user.`);
    }

    try {
      return this.jwtService.sign(tokenPayload);
    } catch (error) {
      this.logger.error(`Failed to share project for user: "${tokenPayload.targetUuid}".`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async processingInvitationToken(token: string): Promise<SharedProjectResponse> {
    const decodedToken: InviteTokenPayloadInterface = this.jwtService.decode(token) as InviteTokenPayloadInterface;
    const { targetUuid, senderUuid, projectUuid, role, availableTranslationLocales } = decodedToken;

    const targetUser = await this.userRepository.findOne({ where: { uuid: targetUuid } });
    const senderUser = await this.userRepository.findOne({ where: { uuid: senderUuid } });
    const projectShared = await this.projectRepository.findOne({ where: { uuid: projectUuid } });

    const foundShared = await this.sharedProjectRepository.findOne({ where: { projectId: projectShared.id, targetId: targetUser.id, senderId: senderUser.id } });

    if (!foundShared) {
      const sharedProject = new SharedProjectEntity();
      sharedProject.senderId = senderUser.id;
      sharedProject.targetId = targetUser.id;
      sharedProject.projectId = projectShared.id;
      sharedProject.projectUuid = projectUuid;
      sharedProject.targetUuid = targetUuid;
      sharedProject.role = role;
      sharedProject.availableTranslationLocales = availableTranslationLocales;

      let shared: SharedProjectEntity;

      try {
        await sharedProject.save();
        shared = await SharedProjectEntity.findOne({ where: { projectId: projectShared.id, targetId: targetUser.id }, relations: ['project'] });
      } catch (error) {
        if (error.code === '23505') {
          this.logger.error(`You already accepted an invitation.`);
          throw new ConflictException(`You already accepted an invitation.`);
        }
        this.logger.error(`Failed to create shared project for user: "${targetUser.id}".`, error.stack);
        throw new InternalServerErrorException();
      }
      return new SharedProjectResponse(shared);
    }
    this.logger.error(`You already accepted an invitation.`);
    throw new ConflictException(`You already accepted an invitation.`);
  }

  async excludeUserFromProject(
    excludeProjectDTO: ExcludeProjectDTO,
  ): Promise<void> {
    const { targetEmail, projectId } = excludeProjectDTO;
    const shared = await SharedProjectEntity.findOne({ where: { targetEmail, projectId }, relations: ['project'] });
    const targetId = shared.targetId;
    if (!shared) {
      this.logger.error(`There is no shared projectId "${projectId}" with user "${targetEmail}"`);
      throw new NotFoundException(`There is no shared projectId "${projectId}" with user "${targetEmail}"`);
    }
    await SharedProjectEntity.delete({ targetId, projectId });
  }

  async manageUserPermissions(
    manageUserPermissionsDTO: ManagePermissionsDTO,
  ): Promise<any> {
    const { targetUuid, projectUuid, availableTranslationLocales } = manageUserPermissionsDTO;

    const targetUser = await this.userRepository.findOne({ where: { uuid: targetUuid } });
    const sharedProject = await this.projectRepository.findOne({ where: { uuid: projectUuid } });

    try {
      SharedProjectEntity.update({ targetId: targetUser.id, projectId: sharedProject.id }, manageUserPermissionsDTO);
    } catch (error) {
      this.logger.error('Cannot update user permissions');
      throw new InternalServerErrorException();
    }
  }
}
