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
    const { targetEmail, projectId, role } = shareProjectDTO;

    const project = await this.projectRepository.findOne({ where: { id: projectId, userId: user.id } });

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
      this.logger.error(`Project with id: "${projectId}" not found`);
      throw new NotFoundException(`Project with id: "${projectId}" not found.`);
    }

    const tokenPayload: InviteTokenPayloadInterface = {
      senderId: user.id,
      targetId: targetUser.id,
      targetEmail,
      projectId,
      projectUuid: project.uuid,
      availableTranslationLocales: `${project.defaultLocale}, ${project.translationsLocales}`,
      role,
    };

    const shared = await SharedProjectEntity.findOne({ where: { targetId: targetUser.id, projectId }, relations: ['project'] });

    if (shared) {
      this.logger.error(`You already shared this project with this user.`);
      throw new ConflictException(`You already shared this project with this user.`);
    }

    try {
      return this.jwtService.sign(tokenPayload);
    } catch (error) {
      this.logger.error(`Failed to share project for user: "${tokenPayload.targetId}".`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async processingInvitationToken(token: string): Promise<SharedProjectEntity> {
    const decodedToken: InviteTokenPayloadInterface = this.jwtService.decode(token) as InviteTokenPayloadInterface;
    const { targetId, senderId, projectId, projectUuid, role, availableTranslationLocales } = decodedToken;
    const foundShared = await this.sharedProjectRepository.findOne({ where: { projectId, targetId, senderId } });

    if (!foundShared) {
      const sharedProject = new SharedProjectEntity();
      sharedProject.senderId = senderId;
      sharedProject.targetId = targetId;
      sharedProject.projectId = projectId;
      sharedProject.projectUuid = projectUuid;
      sharedProject.role = role;
      sharedProject.availableTranslationLocales = availableTranslationLocales;

      let shared: SharedProjectEntity;

      try {
        await sharedProject.save();
        shared = await SharedProjectEntity.findOne({ where: { projectId, targetId }, relations: ['project'] });
      } catch (error) {
        if (error.code === '23505') {
          this.logger.error(`You already accepted an invitation.`);
          throw new ConflictException(`You already accepted an invitation.`);
        }
        this.logger.error(`Failed to create shared project for user: "${targetId}".`, error.stack);
        throw new InternalServerErrorException();
      }
      return shared;
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
    const { targetId, projectId, availableTranslationLocales } = manageUserPermissionsDTO;

    try {
      SharedProjectEntity.update({ targetId, projectId }, manageUserPermissionsDTO);
    } catch (error) {
      this.logger.error('Cannot update user permissions');
      throw new InternalServerErrorException();
    }
  }
}
