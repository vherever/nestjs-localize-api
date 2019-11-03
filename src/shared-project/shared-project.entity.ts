import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { ProjectEntity } from '../project/project.entity';
import { RoleEnum } from '../shared/enums/role.enum';

@Entity('shared-project')
export class SharedProjectEntity extends BaseEntity {
  @PrimaryColumn()
  targetId: number;
  @ManyToOne(() => UserEntity, user => user.projectsSharedWithYou)
  @JoinColumn({ name: 'targetId' })
  target: UserEntity;

  @PrimaryColumn()
  senderId: number;
  @ManyToOne(() => UserEntity, user => user.projectsYouShared)
  @JoinColumn({ name: 'senderId' })
  sender: UserEntity;

  @PrimaryColumn()
  projectId: number;
  @ManyToOne(() => ProjectEntity, project => project.shares)
  @JoinColumn({ name: 'projectId' })
  project: ProjectEntity;

  @Column({ nullable: true })
  role: RoleEnum;
}
