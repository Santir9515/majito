import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import PedidosPage from '../pages/PedidosPage';
import CatalogoPage from '../pages/CatalogoPage';
import InventarioPage from '../pages/InventarioPage';
import UsuariosPage from '../pages/UsuariosPage';
import RutaPorRol from './RutaPorRol';
import RutaProtegida from './RutaProtegida';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    // Todo lo que está acá adentro exige sesión iniciada.
    element: <RutaProtegida />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/pedidos" replace /> },
          { path: 'pedidos', element: <PedidosPage /> },
          { path: 'catalogo', element: <CatalogoPage /> },
          {
            path: 'inventario',
            element: (
              <RutaPorRol ruta="/inventario">
                <InventarioPage />
              </RutaPorRol>
            ),
          },
          {
            path: 'usuarios',
            element: (
              <RutaPorRol ruta="/usuarios">
                <UsuariosPage />
              </RutaPorRol>
            ),
          },
        ],
      },
    ],
  },
]);
