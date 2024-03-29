import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { ProjectModule } from './project/project.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { TranslationModule } from './translation-item/translation.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HttpErrorFilter } from './shared/http-error.filter';
import { UserModule } from './user/user.module';
import { SharedProjectModule } from './shared-project/shared-project.module';
import { LabelModule } from './label/label.module';
import { TranslationLabelModule } from './translation-label/translation-label.module';
import { ExportImportModule } from './export-import/export-import.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    ProjectModule,
    TranslationModule,
    UserModule,
    SharedProjectModule,
    LabelModule,
    TranslationLabelModule,
    ExportImportModule,
  ],
  controllers: [AppController],
  providers: [
    // This is not fully worked. Ex: Serve http://localhost:3000/uploads/ - infinite loading... // todo
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpErrorFilter,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
}
