import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelEntity } from './label.entity';
import { AuthModule } from '../auth/auth.module';
import { LabelController } from './label.controller';
import { LabelService } from './label.service';
import { ProjectEntity } from '../project/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LabelEntity, ProjectEntity]),
    AuthModule,
  ],
  controllers: [LabelController],
  providers: [LabelService],
})
export class LabelModule {
}
