import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from '../auth/user.entity';
import { TranslationEntity } from '../translation/translation.entity';

@Entity('project')
export class ProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  defaultLocale: string;

  @ManyToOne(type => UserEntity, user => user.projects, { eager: false })
  user: UserEntity;

  @OneToMany(type => TranslationEntity, translation => translation.project, { cascade: true })
  translations: TranslationEntity[];

  @Column()
  userId: number;
}
