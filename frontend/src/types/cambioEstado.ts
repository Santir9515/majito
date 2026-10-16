import type { EstadoPedido } from './estadoPedido';

export interface CambioEstado {
  estado: EstadoPedido;
  usuario: string; // id del usuario
  fecha: string;
  motivo?: string;
}