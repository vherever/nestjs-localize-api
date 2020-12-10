import { IsOptional } from 'class-validator';

export class CreateLabelDTO {
  @IsOptional()
  name: string;

  @IsOptional()
  color: string;
}
