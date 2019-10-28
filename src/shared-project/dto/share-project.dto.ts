import { IsNotEmpty } from 'class-validator';

export class ShareProjectDTO {
  @IsNotEmpty()
  targetId: number;

  @IsNotEmpty()
  projectId: number;
}
