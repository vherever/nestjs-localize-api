import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';

import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UserEntity } from './user.entity';
import * as config from 'config';
import { Repository } from 'typeorm';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt').secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const { email } = payload;
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
