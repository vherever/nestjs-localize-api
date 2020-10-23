import { IsNotEmpty, IsString } from 'class-validator';

export class ExcludeProjectDTO {
  @IsString()
  @IsNotEmpty()
  targetEmail: string;

  @IsNotEmpty()
  projectUuid: string;
}
