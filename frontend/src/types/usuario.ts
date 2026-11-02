import type { Rol } from './rol';

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}