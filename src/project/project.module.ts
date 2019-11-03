import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { AuthModule } from '../auth/auth.module';
import { ProjectEntity } from './project.entity';
import { UserEntity } from '../auth/user.entity';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity, SharedProjectEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {
}
