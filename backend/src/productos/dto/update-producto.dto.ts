import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsMongoId } from 'class-validator';
import { CreateProductoDto } from './create-producto.dto';


export class UpdateProductoDto extends PartialType(
  OmitType(CreateProductoDto, ['usuarioId'] as const),
) {
  @IsMongoId()
  usuarioId: string;
}