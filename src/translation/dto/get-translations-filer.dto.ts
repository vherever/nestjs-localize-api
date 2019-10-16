import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetTranslationsFilerDTO {
  @IsOptional()
  @IsNotEmpty()
  search: string;
}
