import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RechazarTicketDto {
  @IsMongoId()
  usuarioId: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;
}
