import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ProjectEntity } from '../project/project.entity';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';
import * as ts from 'typescript/lib/tsserverlibrary';
import Project = ts.server.Project;

@Entity('user')
@Unique(['email'])
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  // @OneToMany(type => ProjectEntity, project => project.user, { eager: true })
  // projects: ProjectEntity[];

  @OneToMany(() => ProjectEntity, project => project.owner)
  projects: ProjectEntity[];

  @OneToMany(() => SharedProjectEntity, sharedProject => sharedProject.target)
  projectsSharedWithYou: Project[];

  @OneToMany(() => SharedProjectEntity, sharedProject => sharedProject.sender)
  projectsYouShared: Project[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
