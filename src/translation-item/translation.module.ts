import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { AuthModule } from '../auth/auth.module';
import { TranslationEntity } from './translation.entity';
import { ProjectEntity } from '../project/project.entity';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TranslationEntity, ProjectEntity, SharedProjectEntity]),
    AuthModule,
  ],
  controllers: [TranslationController],
  providers: [TranslationService],
})
export class TranslationModule {
}
