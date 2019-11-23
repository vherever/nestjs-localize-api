import { IsOptional } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  name: string;

  @IsOptional()
  email: string;
}
