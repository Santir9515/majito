import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { EstadoTicket } from './enums/estado-ticket.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  create(createTicketDto: CreateTicketDto) {
    const { creadoPor, ...rest } = createTicketDto;
    const ticket = new this.ticketModel({
      ...rest,
      creadoPor,
      estado: EstadoTicket.CREADO,
      historial: [{ estado: EstadoTicket.CREADO, usuario: creadoPor, fecha: new Date() }],
    });
    return ticket.save();
  }

  findAll() {
    return this.ticketModel.find().exec();
  }

  findOne(id: string) {
    return this.ticketModel.findById(id).exec();
  }
}