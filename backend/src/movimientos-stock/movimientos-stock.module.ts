import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MovimientoStock,
  MovimientoStockSchema,
} from './schemas/movimiento-stock.schema';
import { MovimientosStockController } from './movimientos-stock.controller';
import { MovimientosStockService } from './movimientos-stock.service';
import { ProductosModule } from '../productos/productos.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MovimientoStock.name, schema: MovimientoStockSchema },
    ]),
    ProductosModule,
    UsersModule,
  ],
  controllers: [MovimientosStockController],
  providers: [MovimientosStockService],
  exports: [MongooseModule, MovimientosStockService],
})
export class MovimientosStockModule {}
