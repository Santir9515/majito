import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AnularTicketDto {
  @IsMongoId()
  usuarioId: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;
}