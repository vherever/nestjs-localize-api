import { BaseEntity, Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';
import { UserEntity } from '../auth/user.entity';

@Entity('translation')
export class TranslationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sourceText: string;

  @Column()
  assetId: string;

  @Column({ nullable: true })
  context: string;

  @Column({ nullable: true })
  labels: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(type => UserEntity)
  @JoinTable()
  author: UserEntity;

  @ManyToOne(type => ProjectEntity, project => project.translations, { eager: false })
  project: ProjectEntity;
}
