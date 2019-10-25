import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable, ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from '../auth/user.entity';
import { TranslationEntity } from '../translation-item/translation.entity';
import { RoleEnum } from '../shared/enums/role.enum';
import { SharedProjectEntity } from './shared-project.entity';

@Entity('project')
export class ProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  defaultLocale: string;

  @Column({ nullable: true })
  translationsLocales: string;

  @ManyToOne(type => UserEntity, user => user.projects, { eager: false })
  user: UserEntity;

  @OneToMany(type => TranslationEntity, translation => translation.project, { cascade: true })
  translations: TranslationEntity[];

  @Column()
  userId: number;

  @Column({ nullable: true })
  role: RoleEnum;

  @Column({ nullable: true })
  ownerId: number;
  @ManyToOne(() => UserEntity, user => user.projects)
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @OneToMany(() => SharedProjectEntity, sharedProject => sharedProject.project)
  shares: SharedProjectEntity[];
}
