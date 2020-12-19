import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// app imports
import { TranslationLabelEntity } from './translation-label.entity';
import { AuthModule } from '../auth/auth.module';
import { TranslationLabelController } from './translation-label.controller';
import { TranslationLabelService } from './translation-label.service';
import { LabelEntity } from '../label/label.entity';
import { ProjectEntity } from '../project/project.entity';
import { TranslationEntity } from '../translation-item/translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TranslationLabelEntity, LabelEntity, ProjectEntity, TranslationEntity]),
    AuthModule,
  ],
  controllers: [TranslationLabelController],
  providers: [TranslationLabelService],
})
export class TranslationLabelModule {
}
