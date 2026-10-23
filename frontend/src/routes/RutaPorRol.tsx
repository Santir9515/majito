import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import { puedeVer } from '../utils/permisos';

// Si el rol actual no puede ver la sección, vuelve a Pedidos.
// El backend valida igual: esto solo mejora la experiencia.
export default function RutaPorRol({ ruta, children }: { ruta: string; children: ReactNode }) {
  const { usuario } = useUsuarioActual();

  if (!puedeVer(usuario.rol, ruta)) {
    return <Navigate to="/pedidos" replace />;
  }
  return <>{children}</>;
}
