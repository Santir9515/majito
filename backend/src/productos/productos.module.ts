import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto, ProductoSchema } from './schemas/producto.schema';
import { UserSchema, User } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Producto.name, schema: ProductoSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [MongooseModule],
})
export class ProductosModule {}