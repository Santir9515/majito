import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { CreateTicketDto, ItemPedidoDto } from './dto/create-ticket.dto';
import { EstadoTicket } from './enums/estado-ticket.enum';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AvanzarTicketDto } from './dto/avanzar-ticket-dto';
import { AnularTicketDto } from './dto/anular-ticket.dto';
import { RechazarTicketDto } from './dto/rechazar-ticket.dto';
import {
  ESTADOS_ANULABLES,
  ESTADOS_RECHAZABLES,
  ROLES_ANULAR,
  ROLES_RECHAZAR,
  TRANSICIONES,
} from './transiciones-estado';
import {
  Producto,
  ProductoDocument,
} from '../productos/schemas/producto.schema';

import { CrearReemplazoDto } from './dto/crear-reemplazo.dto';
import { ROLES_CREAR_REEMPLAZO } from './transiciones-estado';
import { MovimientosStockService } from '../movimientos-stock/movimientos-stock.service';
import { TipoMovimiento } from '../movimientos-stock/enums/tipo-movimiento.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
    private movimientosStockService: MovimientosStockService,
  ) {}

  // Snapshot: nombre y código se copian del catálogo, nunca los manda el client
  private async construirItemsConSnapshot(items: ItemPedidoDto[]) {
    return Promise.all(
      items.map(async (item) => {
        const producto = await this.productoModel.findById(item.productoId);
        if (!producto) {
          throw new NotFoundException(
            `Producto ${item.productoId} no encontrado`,
          );
        }
        return {
          productoId: producto._id,
          productoNombre: producto.nombre,
          productoCodigo: producto.codigo,
          cantidad: item.cantidad,
        };
      }),
    );
  }

  private async obtenerUsuarioActivo(usuarioId: string) {
    const usuario = await this.userModel.findById(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new ForbiddenException('Usuario inexistente o inactivo');
    }
    return usuario;
  }

  async create(createTicketDto: CreateTicketDto) {
    const { creadoPor, items, ...rest } = createTicketDto;
    const itemsConSnapshot = await this.construirItemsConSnapshot(items);

    const ticket = new this.ticketModel({
      ...rest,
      items: itemsConSnapshot,
      creadoPor,
      estado: EstadoTicket.CREADO,
      historial: [
        { estado: EstadoTicket.CREADO, usuario: creadoPor, fecha: new Date() },
      ],
    });
    return ticket.save();
  }

  findAll() {
    return this.ticketModel.find().exec();
  }

  findOne(id: string) {
    return this.ticketModel.findById(id).exec();
  }

  async avanzar(id: string, dto: AvanzarTicketDto) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }

    const usuario = await this.obtenerUsuarioActivo(dto.usuarioId);

    const transicion = TRANSICIONES[ticket.estado];
    if (!transicion) {
      throw new BadRequestException(
        `Un ticket en estado "${ticket.estado}" no puede avanzar`,
      );
    }
    if (!transicion.roles.includes(usuario.rol)) {
      throw new ForbiddenException(
        `El rol "${usuario.rol}" no puede pasar un ticket de "${ticket.estado}" a "${transicion.siguiente}"`,
      );
    }

    // Al facturar se descuenta el stock; si algún ítem no alcanza, no se factura
    const descuentaStock = transicion.siguiente === EstadoTicket.FACTURADO;
    if (descuentaStock) {
      await this.movimientosStockService.aplicarPorTicket(
        ticket._id,
        ticket.items,
        TipoMovimiento.DESCUENTO_FACTURACION,
        usuario._id,
      );
    }

    ticket.estado = transicion.siguiente;
    ticket.historial.push({
      estado: transicion.siguiente,
      usuario: usuario._id,
      fecha: new Date(),
    });

    try {
      return await ticket.save();
    } catch (error) {
      if (descuentaStock) {
        await this.movimientosStockService.deshacerPorTicket(
          ticket._id,
          TipoMovimiento.DESCUENTO_FACTURACION,
        );
      }
      throw error;
    }
  }

  async anular(id: string, dto: AnularTicketDto) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }

    const usuario = await this.obtenerUsuarioActivo(dto.usuarioId);
    if (!ROLES_ANULAR.includes(usuario.rol)) {
      throw new ForbiddenException(
        `El rol "${usuario.rol}" no puede anular tickets`,
      );
    }

    // Un rechazado sin acuerdo con el cliente se anula, pero solo si no tiene reemplazos
    const esRechazadoSinReemplazo =
      ticket.estado === EstadoTicket.RECHAZADO &&
      ticket.ticketsReemplazoIds.length === 0;

    if (
      !ESTADOS_ANULABLES.includes(ticket.estado) &&
      !esRechazadoSinReemplazo
    ) {
      throw new BadRequestException(
        `Un ticket en estado "${ticket.estado}" no puede anularse`,
      );
    }

    ticket.estado = EstadoTicket.ANULADO;
    ticket.motivoAnulacion = dto.motivo;
    ticket.historial.push({
      estado: EstadoTicket.ANULADO,
      usuario: usuario._id,
      fecha: new Date(),
      motivo: dto.motivo,
    });
    return ticket.save();
  }

  async rechazar(id: string, dto: RechazarTicketDto) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }

    const usuario = await this.obtenerUsuarioActivo(dto.usuarioId);
    if (!ROLES_RECHAZAR.includes(usuario.rol)) {
      throw new ForbiddenException(
        `El rol "${usuario.rol}" no puede rechazar tickets`,
      );
    }

    if (!ESTADOS_RECHAZABLES.includes(ticket.estado)) {
      throw new BadRequestException(
        `Un ticket en estado "${ticket.estado}" no puede rechazarse`,
      );
    }

    ticket.estado = EstadoTicket.RECHAZADO;
    ticket.motivoRechazo = dto.motivo;
    ticket.historial.push({
      estado: EstadoTicket.RECHAZADO,
      usuario: usuario._id,
      fecha: new Date(),
      motivo: dto.motivo,
    });
    return ticket.save();
  }

  async crearReemplazo(id: string, dto: CrearReemplazoDto) {
    const origen = await this.ticketModel.findById(id);
    if (!origen) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }

    const usuario = await this.obtenerUsuarioActivo(dto.creadoPor);
    if (!ROLES_CREAR_REEMPLAZO.includes(usuario.rol)) {
      throw new ForbiddenException(
        `El rol "${usuario.rol}" no puede crear tickets de reemplazo`,
      );
    }

    if (origen.estado !== EstadoTicket.RECHAZADO) {
      throw new BadRequestException(
        'Solo se puede crear un reemplazo de un ticket rechazado',
      );
    }

    const items = await this.construirItemsConSnapshot(dto.items);

    const reemplazo = await new this.ticketModel({
      cliente: origen.cliente,
      items,
      notas: dto.notas,
      creadoPor: usuario._id,
      estado: EstadoTicket.CREADO,
      historial: [
        {
          estado: EstadoTicket.CREADO,
          usuario: usuario._id,
          fecha: new Date(),
        },
      ],
      ticketOrigenId: origen._id,
    }).save();

    origen.ticketsReemplazoIds.push(reemplazo._id);
    await origen.save();

    return reemplazo;
  }
}
