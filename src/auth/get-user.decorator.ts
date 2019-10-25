import { createParamDecorator } from '@nestjs/common';

import { UserEntity } from './user.entity';

export const GetUser = createParamDecorator((data, res): UserEntity => {
  return res.user;
});
