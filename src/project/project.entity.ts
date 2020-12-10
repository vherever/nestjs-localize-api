import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// app imports
import { UserEntity } from '../auth/user.entity';
import { TranslationEntity } from '../translation-item/translation.entity';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';
import { LabelEntity } from '../label/label.entity';

@Entity('project')
export class ProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
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

  @OneToMany(() => LabelEntity, label => label.project, { cascade: true })
  labels: LabelEntity[];

  @Column()
  userId: number;

  @Column({ nullable: true })
  ownerId: number;
  @ManyToOne(() => UserEntity, user => user.projects)
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @OneToMany(() => SharedProjectEntity, sharedProject => sharedProject.project)
  shares: SharedProjectEntity[];
}
