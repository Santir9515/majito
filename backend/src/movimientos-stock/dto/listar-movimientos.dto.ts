import { IsMongoId } from 'class-validator';

export class ListarMovimientosDto {
  // Interim: hasta tener JWT, el usuario viaja en la query
  @IsMongoId()
  usuarioId: string;
}