import { useContext } from 'react';
import { UsuarioActualContext } from '../context/UsuarioActualContext';

export function useUsuarioActual() {
  const valor = useContext(UsuarioActualContext);
  if (!valor) {
    throw new Error('useUsuarioActual debe usarse dentro de UsuarioActualProvider');
  }
  return valor;
}
