import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { EstadoTicket } from './enums/estado-ticket.enum';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AvanzarTicketDto } from './dto/avanzar-ticket-dto';
import { ESTADOS_RECHAZABLES, ROLES_ANULAR, ROLES_RECHAZAR, TRANSICIONES } from './transiciones-estado';
import { Producto, ProductoDocument } from '../productos/schemas/producto.schema';
import { AnularTicketDto } from './dto/anular-ticket.dto';
import { ESTADOS_ANULABLES } from './transiciones-estado';
import { RechazarTicketDto } from './dto/rechazar-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    const { creadoPor, items, ...rest } = createTicketDto;

    // Snapshot: nombre y código se copian del catálogo, nunca los manda el cliente
    const itemsConSnapshot = await Promise.all(
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

  private async obtenerUsuarioActivo(usuarioId: string) {
    const usuario = await this.userModel.findById(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new ForbiddenException('Usuario inexistente o inactivo');
    }
    return usuario;
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

    ticket.estado = transicion.siguiente;
    ticket.historial.push({
      estado: transicion.siguiente,
      usuario: usuario._id,
      fecha: new Date(),
    });
    return ticket.save();
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

  if (!ESTADOS_ANULABLES.includes(ticket.estado)) {
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
}

