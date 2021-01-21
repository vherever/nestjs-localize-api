import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// app imports
import { AuthModule } from '../auth/auth.module';
import { ExportImportController } from './export-import.controller';
import { ExportImportService } from './export-import.service';
import { TranslationEntity } from '../translation-item/translation.entity';
import { ProjectEntity } from '../project/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity, TranslationEntity]),
    AuthModule,
  ],
  controllers: [ExportImportController],
  providers: [ExportImportService],
})
export class ExportImportModule {
}
