import { GetProjectResponse } from '../../project/dto/get-project-response';

export class GetUserResponse {
  id: number;
  uuid: string;
  name: string;
  email: string;
  avatar: string;
  projects: GetProjectResponse[];
}
