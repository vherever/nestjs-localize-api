import { RoleEnum } from '../shared/enums/role.enum';

export interface InviteTokenPayloadInterface {
  senderId: number;
  targetId: number;
  targetEmail: string;
  projectId: number;
  projectUuid: string;
  availableTranslationLocales: string;
  role: RoleEnum;
  iat?: number;
  exp?: number;
}
