import { createContext, useState, type ReactNode } from 'react';
import type { Rol } from '../types';

export interface UsuarioActual {
  id: string;
  nombre: string;
  rol: Rol;
}

export interface SesionValor {
  usuario: UsuarioActual | null; // null = no hay sesión iniciada
  iniciarSesion: (usuario: UsuarioActual) => void;
  cerrarSesion: () => void;
}

export const UsuarioActualContext = createContext<SesionValor | null>(null);

// PROVISORIO: la sesión se guarda en sessionStorage (se pierde al cerrar la pestaña)
// para que recargar la página no obligue a loguearse de nuevo.
// Con el login real (JWT) acá se guardaría el token.
const CLAVE_SESION = 'majito.usuario';

function leerUsuarioGuardado(): UsuarioActual | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_SESION);
    return crudo ? (JSON.parse(crudo) as UsuarioActual) : null;
  } catch {
    return null;
  }
}

export function UsuarioActualProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioActual | null>(leerUsuarioGuardado);

  const iniciarSesion = (nuevo: UsuarioActual) => {
    setUsuario(nuevo);
    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(nuevo));
    } catch {
      // Si el navegador no deja guardar, la sesión dura hasta recargar y nada más.
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      // Nada que hacer: no había nada guardado que borrar.
    }
  };

  return (
    <UsuarioActualContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </UsuarioActualContext.Provider>
  );
}
