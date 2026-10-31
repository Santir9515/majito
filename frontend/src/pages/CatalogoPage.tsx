import { useEffect, useState } from 'react';
import type { Producto } from '../types';
import { listarProductos } from '../services/productosService';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import { puedeVerPrecios } from '../utils/permisos';

const formatoPesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export default function CatalogoPage() {
  const { usuario } = useUsuarioActual();
  const verPrecios = puedeVerPrecios(usuario.rol);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // `activo` evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta.
    let activo = true;
    listarProductos()
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
  }, []);

  if (cargando) return <p>Cargando productos…</p>;
  if (error) return <p>No se pudieron cargar los productos: {error}</p>;

  return (
    <div>
      <h2>Catálogo</h2>
      {productos.length === 0 ? (
        <p>No hay productos cargados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              {verPrecios && <th>Precio de lista</th>}
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p._id}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria ?? '—'}</td>
                {verPrecios && (
                  <td>{p.precio !== undefined ? formatoPesos.format(p.precio) : '—'}</td>
                )}
                <td>{p.activo ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}