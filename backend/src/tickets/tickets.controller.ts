import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AvanzarTicketDto } from './dto/avanzar-ticket-dto';
import { AnularTicketDto } from './dto/anular-ticket.dto';
import { RechazarTicketDto } from './dto/rechazar-ticket.dto';
import { CrearReemplazoDto } from './dto/crear-reemplazo.dto';
import { Body, Controller, Get, Param, Post, Patch, Query } from '@nestjs/common';
import { ListarTicketsDto } from './dto/listar-tickets.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll(@Query() dto: ListarTicketsDto) {
    return this.ticketsService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id/avanzar')
  avanzar(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: AvanzarTicketDto) {
    return this.ticketsService.avanzar(id, dto);
  }

  @Patch(':id/anular')
  anular(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: AnularTicketDto) {
    return this.ticketsService.anular(id, dto);
  }

  @Patch(':id/rechazar')
  rechazar(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: RechazarTicketDto) {
    return this.ticketsService.rechazar(id, dto);
  }

  @Post(':id/reemplazo')
  crearReemplazo(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: CrearReemplazoDto) {
    return this.ticketsService.crearReemplazo(id, dto);
  }
}
