import { RoleEnum } from '../shared/enums/role.enum';

export interface InviteTokenPayloadInterface {
  senderId: number;
  targetId: number;
  targetEmail: string;
  projectId: number;
  translationLocales: string;
  role: RoleEnum;
  iat?: number;
  exp?: number;
}
