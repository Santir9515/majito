import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoMovimiento } from '../enums/tipo-movimiento.enum';

export type MovimientoStockDocument = HydratedDocument<MovimientoStock>;

// Registro de auditoría: los movimientos solo se agregan, nunca se editan ni se borran
@Schema({ collection: 'movimientos_stock' })
export class MovimientoStock {
  @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
  productoId: Types.ObjectId;

  @Prop({ required: true, enum: TipoMovimiento })
  tipo: TipoMovimiento;

  // Con signo: positivo ingresa stock, negativo lo descuenta
  @Prop({
    required: true,
    validate: {
      validator: (v: number) => Number.isFinite(v) && v !== 0,
      message: 'La cantidad no puede ser cero',
    },
  })
  cantidad: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuarioId: Types.ObjectId;

  // Solo en movimientos originados por un ticket (facturación o anulación)
  @Prop({ type: Types.ObjectId, ref: 'Ticket' })
  ticketId?: Types.ObjectId;

  // Obligatorio para ajustes manuales (se valida en el DTO)
  @Prop()
  motivo?: string;

  @Prop({ required: true, default: Date.now })
  fecha: Date;
}

export const MovimientoStockSchema =
  SchemaFactory.createForClass(MovimientoStock);

// Para listar rápido los movimientos de un producto, del más reciente al más antiguo
MovimientoStockSchema.index({ productoId: 1, fecha: -1 });
