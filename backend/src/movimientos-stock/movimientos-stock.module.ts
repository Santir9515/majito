import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MovimientoStock,
  MovimientoStockSchema,
} from './schemas/movimiento-stock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MovimientoStock.name, schema: MovimientoStockSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class MovimientosStockModule {}