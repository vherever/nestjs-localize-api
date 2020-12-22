import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectEntity } from '../project/project.entity';
import { UserEntity } from '../auth/user.entity';
import { TranslationLabelEntity } from '../translation-label/translation-label.entity';
import { LabelEntity } from '../label/label.entity';

@Entity('translation')
export class TranslationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column()
  translations: string;

  @Column({ nullable: true })
  assetCode: string;

  /**
   * Unique code in format projectId-translationId
   * determine if this asset code is already exist in the current project
   */
  @Column({ unique: true, nullable: true })
  assetProjectCode: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  status: string;

  @ManyToOne(type => UserEntity, user => user.projects)
  user: UserEntity;

  @ManyToOne(type => ProjectEntity, project => project.translations, { eager: false, onDelete: 'CASCADE' })
  project: ProjectEntity;

  @Column()
  userId: number;

  @Column()
  projectId: number;

  @Column({ type: 'uuid' })
  projectUuid: string;

  @ManyToOne(type => UserEntity, user => user.id)
  userLastUpdatedId: UserEntity;

  // @OneToMany(() => TranslationLabelEntity, sharedLabel => sharedLabel.targetTranslation)
  // translationLabels: LabelEntity[];
}
