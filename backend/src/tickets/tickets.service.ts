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
import { TRANSICIONES } from './transiciones-estado';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  create(createTicketDto: CreateTicketDto) {
    const { creadoPor, ...rest } = createTicketDto;
    const ticket = new this.ticketModel({
      ...rest,
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

    const usuario = await this.userModel.findById(dto.usuarioId);
    if (!usuario || !usuario.activo) {
      throw new ForbiddenException('Usuario inexistente o inactivo');
    }

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
}