import { Body, Controller, Logger, Post, ValidationPipe } from '@nestjs/common';

import { AuthCredentialsRegisterDTO } from './dto/auth-credentials-register.dto';
import { AuthService } from './auth.service';
import { AuthCredentialsLoginDTO } from './dto/auth-credentials-login.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private authService: AuthService) {
  }

  @Post('/signup')
  signUp(@Body(ValidationPipe) authCredentialsDTO: AuthCredentialsRegisterDTO): Promise<void> {
    this.logger.verbose(`Registering a new user with email: ${authCredentialsDTO.email}.`);
    return this.authService.signUp(authCredentialsDTO);
  }

  @Post('/signin')
  signIn(@Body(ValidationPipe) authCredentialsDTO: AuthCredentialsLoginDTO): Promise<{ accessToken: string }> {
    this.logger.verbose(`Logging a user with email: ${authCredentialsDTO.email}.`);
    return this.authService.signIn(authCredentialsDTO);
  }
}
