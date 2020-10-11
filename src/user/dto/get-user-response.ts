import { UserEntity } from '../../auth/user.entity';

export class GetUserResponse {
  constructor(user: UserEntity) {
    this.id = user.id;
    this.uuid = user.uuid;
    this.name = user.name;
    this.email = user.email;
    this.avatar = user.avatar;
  }
  id: number;
  uuid: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
  availableTranslationLocales?: string;
}
