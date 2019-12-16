import {
  Body,
  Controller,
  Get, InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';
// app imports
import { UserService } from './user.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import { GetUserResponse } from './dto/get-user-response';

const pngFileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    req.fileValidationError = 'Invalid file type';
    return cb(new InternalServerErrorException('Invalid file type'), false);
  }
};

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

  @Post('/:id/avatar')
  @UseInterceptors(FileInterceptor('image', {
    fileFilter: pngFileFilter,
    limits: {fileSize: 5242880},
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        return cb(null, `${file.originalname}`);
      },
    }),
  }))
  uploadAvatar(
    @Param('id', ParseIntPipe) userId: number,
    @GetUser() user: UserEntity,
    @UploadedFile() avatar: any,
  ): Promise<string> {
    return this.userService.uploadAvatar(userId, user, avatar.originalname);
  }
}
