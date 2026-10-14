import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { TipoMovimiento } from '../enums/tipo-movimiento.enum';

export class CrearMovimientoDto {
  @IsMongoId()
  productoId: string;

  // Los movimientos de facturación y anulación los genera el sistema, no se cargan a mano
  @IsIn([TipoMovimiento.MIGRACION_INICIAL, TipoMovimiento.AJUSTE_MANUAL])
  tipo: TipoMovimiento;

  @IsNumber()
  cantidad: number;

  // Interim: hasta tener JWT, el usuario viaja en el body
  @IsMongoId()
  usuarioId: string;

  @ValidateIf((o: CrearMovimientoDto) => o.tipo === TipoMovimiento.AJUSTE_MANUAL)
  @IsString()
  @IsNotEmpty()
  motivo?: string;
}