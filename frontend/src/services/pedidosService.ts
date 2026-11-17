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

export interface NuevoPedido {
  cliente: string;
  items: { productoId: string; cantidad: number }[];
  notas?: string;
  creadoPor: string; // id del usuario que crea el pedido
}

// POST /tickets: crea el pedido en estado "creado".
export function crearPedido(datos: NuevoPedido): Promise<Pedido> {
  return pedirJSON<Pedido>('/tickets', { method: 'POST', body: JSON.stringify(datos) });
}

// Cambios de estado: el backend valida el rol del usuario y devuelve el pedido actualizado.
function cambiarEstado(id: string, accion: string, cuerpo: object): Promise<Pedido> {
  return pedirJSON<Pedido>(`/tickets/${id}/${accion}`, {
    method: 'PATCH',
    body: JSON.stringify(cuerpo),
  });
}

export function avanzarPedido(id: string, usuarioId: string): Promise<Pedido> {
  return cambiarEstado(id, 'avanzar', { usuarioId });
}

export function rechazarPedido(id: string, usuarioId: string, motivo: string): Promise<Pedido> {
  return cambiarEstado(id, 'rechazar', { usuarioId, motivo });
}

export function anularPedido(id: string, usuarioId: string, motivo: string): Promise<Pedido> {
  return cambiarEstado(id, 'anular', { usuarioId, motivo });
}

export interface NuevoReemplazo {
  creadoPor: string; // id del usuario que crea el reemplazo
  items: { productoId: string; cantidad: number }[];
  notas?: string;
}

// POST /tickets/:id/reemplazo: crea un pedido nuevo a partir de uno rechazado.
export function crearReemplazo(idRechazado: string, datos: NuevoReemplazo): Promise<Pedido> {
  return pedirJSON<Pedido>(`/tickets/${idRechazado}/reemplazo`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}