import { createContext, useState, type ReactNode } from 'react';
import type { Rol } from '../types';

export interface UsuarioActual {
  id: string;
  nombre: string;
  rol: Rol;
}

// PROVISORIO: hasta que exista el login con JWT.
// Completar los ids con los usuarios de prueba (sección 8 de la doc de la API).
const USUARIOS_PRUEBA: Record<Rol, UsuarioActual> = {
  vendedor: { id: '', nombre: 'Vendedor de prueba', rol: 'vendedor' },
  deposito: { id: '', nombre: 'Depósito de prueba', rol: 'deposito' },
  administracion: { id: '', nombre: 'Administración de prueba', rol: 'administracion' },
};

export interface UsuarioActualValor {
  usuario: UsuarioActual;
  cambiarRol: (rol: Rol) => void; // solo para desarrollo
}

export const UsuarioActualContext = createContext<UsuarioActualValor | null>(null);

export function UsuarioActualProvider({ children }: { children: ReactNode }) {
  const [rol, setRol] = useState<Rol>('administracion');

  return (
    <UsuarioActualContext.Provider
      value={{ usuario: USUARIOS_PRUEBA[rol], cambiarRol: setRol }}
    >
      {children}
    </UsuarioActualContext.Provider>
  );
}
