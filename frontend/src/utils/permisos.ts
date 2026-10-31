import type { Rol } from '../types';

export interface Seccion {
  ruta: string;
  etiqueta: string;
  roles: Rol[]; // roles que pueden ver la sección
}

export const ETIQUETA_ROL: Record<Rol, string> = {
  vendedor: 'Vendedor',
  deposito: 'Depósito',
  administracion: 'Administración',
};

const TODOS: Rol[] = ['vendedor', 'deposito', 'administracion'];

// Secciones de la navegación. Inventario y Usuarios son solo de Administración.
export const SECCIONES: Seccion[] = [
  { ruta: '/pedidos', etiqueta: 'Pedidos', roles: TODOS },
  { ruta: '/catalogo', etiqueta: 'Catálogo', roles: TODOS },
  { ruta: '/inventario', etiqueta: 'Inventario', roles: ['administracion'] },
  { ruta: '/usuarios', etiqueta: 'Usuarios', roles: ['administracion'] },
];

export function seccionesPara(rol: Rol): Seccion[] {
  return SECCIONES.filter((s) => s.roles.includes(rol));
}

export function puedeVer(rol: Rol, ruta: string): boolean {
  return SECCIONES.some((s) => s.ruta === ruta && s.roles.includes(rol));
}
// Solo Administración y Vendedor pueden ver el precio de lista; Depósito no.
export function puedeVerPrecios(rol: Rol): boolean {
  return rol === 'administracion' || rol === 'vendedor';
}