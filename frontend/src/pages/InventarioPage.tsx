import { useEffect, useState } from 'react';
import type { Producto } from '../types';
import { listarProductos } from '../services/productosService';
import { useUsuarioActual } from '../hooks/useUsuarioActual';

const formatoPesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

// Panel de solo consulta para Administración: stock actual y precio de costo (RF-19).
export default function InventarioPage() {
  const { usuario } = useUsuarioActual();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // `activo` evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta.
    let activo = true;
    // Se envía el id del usuario para que el backend incluya el precio de costo.
    listarProductos(usuario.id)
      .then((datos) => {
        if (activo) setProductos(datos);
      })
      .catch((e: Error) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [usuario.id]);

  if (cargando) return <p>Cargando inventario…</p>;
  if (error) return <p>No se pudo cargar el inventario: {error}</p>;

  return (
    <div>
      <h2>Inventario</h2>
      {productos.length === 0 ? (
        <p>No hay productos cargados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Stock actual</th>
              <th>Precio de costo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p._id}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria ?? '—'}</td>
                <td>{p.stockActual}</td>
                <td>{p.precioCosto !== undefined ? formatoPesos.format(p.precioCosto) : '—'}</td>
                <td>{p.activo ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}