import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MovimientosStockService } from './movimientos-stock.service';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';
import { ListarMovimientosDto } from './dto/listar-movimientos.dto';

@Controller('movimientos-stock')
export class MovimientosStockController {
  constructor(private readonly movimientosService: MovimientosStockService) {}

  @Post()
  registrarManual(@Body() dto: CrearMovimientoDto) {
    return this.movimientosService.registrarManual(dto);
  }

  @Get('producto/:productoId')
  listarPorProducto(
    @Param('productoId', ParseObjectIdPipe) productoId: string,
    @Query() query: ListarMovimientosDto,
  ) {
    return this.movimientosService.listarPorProducto(
      productoId,
      query.usuarioId,
    );
  }
}
