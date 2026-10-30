import { useContext } from 'react';
import { UsuarioActualContext } from '../context/UsuarioActualContext';

// Acceso a la sesión completa: el usuario puede ser null (no hay sesión iniciada).
// Lo usan el login y la ruta protegida. El resto de las pantallas usan useUsuarioActual.
export function useSesion() {
  const valor = useContext(UsuarioActualContext);
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de UsuarioActualProvider');
  }
  return valor;
}
