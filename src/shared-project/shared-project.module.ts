import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedProjectController } from './shared-project.controller';
import { SharedProjectService } from './shared-project.service';
import { AuthModule } from '../auth/auth.module';
import { ProjectEntity } from '../project/project.entity';
import { UserEntity } from '../auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [SharedProjectController],
  providers: [SharedProjectService],
})
export class SharedProjectModule {
}
