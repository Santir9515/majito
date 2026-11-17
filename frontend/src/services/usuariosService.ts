import type { Rol, Usuario } from '../types';
import { pedirJSON } from './api';

// Conectado al backend: GET /users, POST /users y PATCH /users/:id.

export interface NuevoUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export function listarUsuarios(): Promise<Usuario[]> {
  return pedirJSON<Usuario[]>('/users');
}

export function crearUsuario(datos: NuevoUsuario): Promise<Usuario> {
  return pedirJSON<Usuario>('/users', { method: 'POST', body: JSON.stringify(datos) });
}

// Activa o desactiva un usuario. Un usuario inactivo no puede iniciar sesión ni operar.
export function cambiarActivo(id: string, activo: boolean): Promise<Usuario> {
  return pedirJSON<Usuario>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  });
}