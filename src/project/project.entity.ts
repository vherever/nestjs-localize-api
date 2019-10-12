import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from '../auth/user.entity';

@Entity()
export class ProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(type => UserEntity, user => user.projects, { eager: false })
  user: UserEntity;

  @Column()
  userId: number;
}
