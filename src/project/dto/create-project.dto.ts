import { IsNotEmpty } from 'class-validator';

export class CreateProjectDTO {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
