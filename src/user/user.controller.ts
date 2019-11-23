import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import { GetUserResponse } from './dto/get-user-response';

@Controller('users')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get('/:id')
  getUser(
    @Param('id', ParseIntPipe) userId: number,
    @GetUser() user: UserEntity,
  ): Promise<GetUserResponse> {
    return this.userService.getUser(userId, user);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @GetUser() user: UserEntity,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<GetUserResponse> {
    return this.userService.updateUser(userId, user, updateUserDTO);
  }
}
