import { RoleEnum } from '../shared/enums/role.enum';

export interface InviteTokenPayloadInterface {
  senderUuid: string;
  targetUuid: string;
  targetEmail: string;
  projectUuid: string;
  availableTranslationLocales: string;
  role: RoleEnum;
  iat?: number;
  exp?: number;
}
