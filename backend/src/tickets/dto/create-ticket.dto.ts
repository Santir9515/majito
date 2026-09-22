import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class ItemPedidoDto {
  @IsNotEmpty()
  @IsMongoId()
  productoId: string;

  @Min(1)
  cantidad: number;
}

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  cliente: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  @IsOptional()
  @IsString()
  notas?: string;

  @IsNotEmpty()
  @IsMongoId()
  creadoPor: string;
}