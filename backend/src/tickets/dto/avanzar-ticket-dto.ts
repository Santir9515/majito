import { IsMongoId } from 'class-validator';

export class AvanzarTicketDto {
  @IsMongoId()
  usuarioId: string;
}
