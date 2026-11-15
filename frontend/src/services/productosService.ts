import type { Producto } from '../types';
import { pedirJSON } from './api';

// Conectado al backend: GET /productos y GET /productos/:id
// (en desarrollo, a través del proxy /api de Vite).

// Si se pasa el id de un usuario de Administración, el backend incluye `precioCosto`.
function conUsuario(ruta: string, usuarioId?: string): string {
  return usuarioId ? `${ruta}?usuarioId=${usuarioId}` : ruta;
}

export function listarProductos(usuarioId?: string): Promise<Producto[]> {
  return pedirJSON<Producto[]>(conUsuario('/productos', usuarioId));
}

export function obtenerProducto(id: string, usuarioId?: string): Promise<Producto> {
  return pedirJSON<Producto>(conUsuario(`/productos/${id}`, usuarioId));
}