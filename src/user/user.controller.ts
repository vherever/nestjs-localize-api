import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserModel } from './user.model';

@Controller('users')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get('/:id')
  getUser(
    @Param('id', ParseIntPipe) userId: number,
    @GetUser() user: UserEntity,
  ): Promise<UserModel> {
    return this.userService.getUser(userId, user);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @GetUser() user: UserEntity,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<UserModel> {
    return this.userService.updateUser(userId, user, updateUserDTO);
  }
}
