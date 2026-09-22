import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class ItemPedido {
  @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
  productoId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  cantidad: number;
}

export const ItemPedidoSchema = SchemaFactory.createForClass(ItemPedido);