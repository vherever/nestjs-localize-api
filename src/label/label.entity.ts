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
// app imports
import { ProjectEntity } from '../project/project.entity';
import { TranslationLabelEntity } from '../translation-label/translation-label.entity';

@Entity('label')
export class LabelEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectUuid: string;

  @Column()
  @Generated('uuid')
  uuid: string;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  color: string;

  @ManyToOne(() => ProjectEntity, project => project.labels, { eager: false, onDelete: 'CASCADE' })
  project: ProjectEntity;

  @OneToMany(() => TranslationLabelEntity, translationLabel => translationLabel.label, { onUpdate: 'CASCADE' })
  translationLabel: TranslationLabelEntity[];
}
