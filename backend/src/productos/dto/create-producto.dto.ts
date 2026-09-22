import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductoDto {
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsNumber()
  @Min(0)
  stockActual: number;
}