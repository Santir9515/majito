import type { UsuarioActual } from '../context/UsuarioActualContext';
import type { Usuario } from '../types';
import { pedirJSON } from './api';

// Conectado al backend: POST /auth/login valida el email y la contraseña (RF-01).
// Todavía no hay token: el backend devuelve el usuario, y las acciones se
// identifican con su id (el mismo que usa UsuarioActual).
export async function iniciarSesion(email: string, password: string): Promise<UsuarioActual> {
  const usuario = await pedirJSON<Usuario>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  return { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol };
}