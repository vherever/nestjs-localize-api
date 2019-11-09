import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private jwtService: JwtService,
  ) {
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  private async validateUserPassword(authCredentialsDTO: AuthCredentialsDTO): Promise<string> {
    const { email, password } = authCredentialsDTO;
    const user = await this.userRepository.findOne({ email });

    if (user && await user.validatePassword(password)) {
      return user.email;
    } else {
      return null;
    }
  }

  async signUp(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    const { email, password } = authCredentialsDTO;

    const user = this.userRepository.create();
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);

    try {
      await user.save();
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`Email ${user.email} already exists.`);
        throw new ConflictException(`Email already exists.`);
      } else {
        this.logger.error('Can not login.');
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(authCredentialsDTO: AuthCredentialsDTO): Promise<{ accessToken: string }> {
    const email = await this.validateUserPassword(authCredentialsDTO);

    if (!email) {
      this.logger.error('Invalid credentials.');
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload: JwtPayload = { email };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(`Generated JWT token with payload ${JSON.stringify(payload)}`);

    return { accessToken };
  }
}
