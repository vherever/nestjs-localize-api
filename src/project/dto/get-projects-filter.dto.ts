import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetProjectsFilterDTO {
  @IsOptional()
  @IsNotEmpty()
  search: string;
}
