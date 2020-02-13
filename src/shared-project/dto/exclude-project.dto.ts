import { IsNotEmpty, IsString } from 'class-validator';

export class ExcludeProjectDTO {
  @IsString()
  @IsNotEmpty()
  targetEmail: string;

  @IsNotEmpty()
  projectId: number;
}
