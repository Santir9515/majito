import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoTicket } from '../enums/estado-ticket.enum';
import { ItemPedido, ItemPedidoSchema } from './item-pedido.schema';
import { HistorialEntry, HistorialEntrySchema } from './historial-entry.schema';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true })
  cliente: string;

  @Prop({ type: [ItemPedidoSchema], required: true })
  items: ItemPedido[];

  @Prop({ required: true, enum: EstadoTicket, default: EstadoTicket.CREADO })
  estado: EstadoTicket;

  @Prop()
  notas?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creadoPor: Types.ObjectId;

  @Prop({ type: [HistorialEntrySchema], default: [] })
  historial: HistorialEntry[];

  @Prop()
  motivoAnulacion?: string;

  @Prop()
  motivoRechazo?: string;

  @Prop({ type: Types.ObjectId, ref: 'Ticket' })
  ticketOrigenId?: Types.ObjectId;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);