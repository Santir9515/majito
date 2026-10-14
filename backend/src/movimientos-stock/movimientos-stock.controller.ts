import { Body, Controller, Post } from '@nestjs/common';
import { MovimientosStockService } from './movimientos-stock.service';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';

@Controller('movimientos-stock')
export class MovimientosStockController {
  constructor(private readonly movimientosService: MovimientosStockService) {}

  @Post()
  registrarManual(@Body() dto: CrearMovimientoDto) {
    return this.movimientosService.registrarManual(dto);
  }
}