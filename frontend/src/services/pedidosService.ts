import type { EstadoPedido, Pedido } from '../types';
import { pedirJSON } from './api';

// Conectado al backend: GET /tickets (con filtro opcional por estado)
// y GET /tickets/:id (en desarrollo, a través del proxy /api de Vite).

export function listarPedidos(estados?: EstadoPedido[]): Promise<Pedido[]> {
  const consulta = estados && estados.length > 0 ? `?estado=${estados.join(',')}` : '';
  return pedirJSON<Pedido[]>(`/tickets${consulta}`);
}

export function obtenerPedido(id: string): Promise<Pedido> {
  return pedirJSON<Pedido>(`/tickets/${id}`);
}
