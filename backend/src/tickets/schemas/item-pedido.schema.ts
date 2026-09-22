import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ItemPedido {
  @Prop({ required: true })
  material: string;

  @Prop({ required: true, min: 1 })
  cantidad: number;
}

export const ItemPedidoSchema = SchemaFactory.createForClass(ItemPedido);