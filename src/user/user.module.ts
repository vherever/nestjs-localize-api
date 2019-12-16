import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// app imports
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from '../auth/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
