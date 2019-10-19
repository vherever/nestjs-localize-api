import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UserEntity } from '../auth/user.entity';
import { TranslationEntity } from '../translation-item/translation.entity';

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
}
