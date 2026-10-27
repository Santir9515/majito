import { IsOptional, IsString } from 'class-validator';

export class ListarTicketsDto {
  @IsOptional()
  @IsString()
  estado?: string;
}