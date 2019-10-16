import { Body, Controller, Logger, Post, ValidationPipe } from '@nestjs/common';

import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private authService: AuthService) {
  }

  @Post('/signup')
  signUp(@Body(ValidationPipe) authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    this.logger.verbose(`Registering a new user with username: ${authCredentialsDTO.username}.`);
    return this.authService.signUp(authCredentialsDTO);
  }

  @Post('/signin')
  signIn(@Body(ValidationPipe) authCredentialsDTO: AuthCredentialsDTO): Promise<{ accessToken: string }> {
    this.logger.verbose(`Logging a user with username: ${authCredentialsDTO.username}.`);
    return this.authService.signIn(authCredentialsDTO);
  }
}
