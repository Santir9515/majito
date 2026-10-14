import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ItemPedidoDto } from './create-ticket.dto';

export class CrearReemplazoDto {
  @IsMongoId()
  creadoPor: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  @IsOptional()
  @IsString()
  notas?: string;
}