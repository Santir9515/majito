import type { EstadoPedido } from './estadoPedido';
import type { ItemPedido } from './itemPedido';
import type { CambioEstado } from './cambioEstado';

export interface Pedido {
  _id: string;
  cliente: string;
  items: ItemPedido[];
  estado: EstadoPedido;
  notas?: string;
  creadoPor: string; // id del usuario
  historial: CambioEstado[];
  motivoAnulacion?: string;
  motivoRechazo?: string;
  ticketOrigenId?: string;
  ticketsReemplazoIds: string[];
  createdAt: string;
  updatedAt: string;
}