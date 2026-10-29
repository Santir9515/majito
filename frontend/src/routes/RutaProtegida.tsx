import { Navigate, Outlet } from 'react-router-dom';
import { useSesion } from '../hooks/useSesion';

// Si no hay sesión iniciada, manda al login. Envuelve a todas las pantallas internas.
export default function RutaProtegida() {
  const { usuario } = useSesion();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
