import { GetProjectResponse } from '../../project/dto/get-project-response';

export class GetUserResponse {
  id: number;
  name: string;
  email: string;
  projects: GetProjectResponse[];
}
