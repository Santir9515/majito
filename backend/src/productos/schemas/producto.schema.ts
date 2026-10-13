import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductoDocument = HydratedDocument<Producto>;

@Schema({ timestamps: true })
export class Producto {
  @Prop({ required: true, unique: true })
  codigo: string;

  @Prop({ required: true })
  nombre: string;

  @Prop()
  categoria?: string;

  @Prop({ required: true, min: 0 })
  precio: number;

  @Prop({ required: true, default: 0, min: 0 })
  stockActual: number;

  @Prop({ default: true })
  activo: boolean;
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);