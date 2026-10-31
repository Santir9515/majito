import type { Producto } from '../types';
import { pedirJSON } from './api';

// Conectado al backend: GET /productos y GET /productos/:id
// (en desarrollo, a través del proxy /api de Vite).

export function listarProductos(): Promise<Producto[]> {
  return pedirJSON<Producto[]>('/productos');
}

export function obtenerProducto(id: string): Promise<Producto> {
  return pedirJSON<Producto>(`/productos/${id}`);
}