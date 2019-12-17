import {
  Body,
  Controller,
  Get, Logger,
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
import { diskStorage } from 'multer';
// app imports
import { UserService } from './user.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import { GetUserResponse } from './dto/get-user-response';
import { FileUploaderHelper, fileExtensionFilter } from '../shared/file-uploader-helper';

@Controller('users')
@UseGuards(AuthGuard())
export class UserController extends FileUploaderHelper {
  private logger = new Logger('UserController');

  constructor(private userService: UserService) {
    super();
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
    fileFilter: fileExtensionFilter,
    limits: {fileSize: 5242880}, // 5MB
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
  ): Promise<any> {
    this.compressImage(avatar.originalname).then(() => {
      this.logger.verbose('Image was optimized.');
    });

    return this.userService.uploadAvatar(userId, user, avatar.originalname);
  }
}
