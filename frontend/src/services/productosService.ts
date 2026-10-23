import type { Producto } from '../types';
import { PRODUCTOS, simularLatencia } from './mock/datos';

// SERVICIO MOCK: devuelve datos de ejemplo.
// Cuando se conecte al backend, solo cambia el interior de estas funciones
// (GET /api/productos y GET /api/productos/:id); las pantallas no se tocan.

export async function listarProductos(): Promise<Producto[]> {
  await simularLatencia();
  return structuredClone(PRODUCTOS);
}

export async function obtenerProducto(id: string): Promise<Producto> {
  await simularLatencia();
  const producto = PRODUCTOS.find((p) => p._id === id);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }
  return structuredClone(producto);
}
