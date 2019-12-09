import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';
import { UserEntity } from '../auth/user.entity';

@Entity('translation')
export class TranslationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column()
  translations: string;

  @Column({ nullable: true })
  assetCode: string;

  @Column({ unique: true, nullable: true })
  assetProjectCode: string;

  @Column({ nullable: true })
  context: string;

  @Column({ nullable: true })
  labels: string;

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
}
