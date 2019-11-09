import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { SharedProjectController } from './shared-project.controller';
import { SharedProjectService } from './shared-project.service';
import { AuthModule } from '../auth/auth.module';
import { ProjectEntity } from '../project/project.entity';
import { UserEntity } from '../auth/user.entity';

import * as config from 'config';
const jwtConfig = config.get('jwt');

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity, UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    AuthModule,
  ],
  controllers: [SharedProjectController],
  providers: [SharedProjectService],
})
export class SharedProjectModule {
}
