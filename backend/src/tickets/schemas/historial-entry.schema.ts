import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EstadoTicket } from '../enums/estado-ticket.enum';

@Schema({ _id: false })
export class HistorialEntry {
  @Prop({ required: true, enum: EstadoTicket })
  estado: EstadoTicket;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId;

  @Prop({ default: Date.now })
  fecha: Date;

  @Prop()
  motivo?: string;
}

export const HistorialEntrySchema = SchemaFactory.createForClass(HistorialEntry);