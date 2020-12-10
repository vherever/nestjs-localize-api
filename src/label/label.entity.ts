import { BaseEntity, Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';

@Entity('label')
export class LabelEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
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
}
