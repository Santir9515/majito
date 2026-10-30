import { useSesion } from './useSesion';

// Para las pantallas que solo existen con sesión iniciada: el usuario nunca es null.
// Si se usa donde no hay sesión, lanza un error en vez de devolver null.
export function useUsuarioActual() {
  const { usuario, cerrarSesion } = useSesion();
  if (!usuario) {
    throw new Error('useUsuarioActual requiere una sesión iniciada');
  }
  return { usuario, cerrarSesion };
}
