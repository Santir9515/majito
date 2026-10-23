import type { Pedido } from '../types';
import { PEDIDOS, simularLatencia } from './mock/datos';

// SERVICIO MOCK: devuelve datos de ejemplo.
// Cuando se conecte al backend, solo cambia el interior de estas funciones
// (GET /api/tickets y GET /api/tickets/:id); las pantallas no se tocan.

export async function listarPedidos(): Promise<Pedido[]> {
  await simularLatencia();
  return structuredClone(PEDIDOS);
}

export async function obtenerPedido(id: string): Promise<Pedido> {
  await simularLatencia();
  const pedido = PEDIDOS.find((p) => p._id === id);
  if (!pedido) {
    throw new Error('Pedido no encontrado');
  }
  return structuredClone(pedido);
}
