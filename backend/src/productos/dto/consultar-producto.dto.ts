import {IsMongoId, IsOptional} from 'class-validator';

export class ConsultarProductoDto {
  @IsOptional()
  @IsMongoId()
  usuarioId?: string;
}