import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { AuthModule } from '../auth/auth.module';
import { TranslationEntity } from './translation.entity';
import { ProjectEntity } from '../project/project.entity';
import { SharedProjectEntity } from '../shared-project/shared-project.entity';
import { LabelEntity } from '../label/label.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TranslationEntity, ProjectEntity, SharedProjectEntity, LabelEntity]),
    AuthModule,
  ],
  controllers: [TranslationController],
  providers: [TranslationService],
})
export class TranslationModule {
}
