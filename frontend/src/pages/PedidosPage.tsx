import { useEffect, useState } from 'react';
import type { EstadoPedido, Pedido } from '../types';
import { listarPedidos } from '../services/pedidosService';
import { ESTADOS_PEDIDO, NOMBRE_ESTADO } from '../utils/estadosPedido';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import NuevoPedidoForm from '../components/NuevoPedidoForm';
import { Link } from 'react-router-dom';

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState<EstadoPedido | ''>('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { usuario } = useUsuarioActual();
  const puedeCrear = usuario.rol === 'vendedor';
  const [mostrarForm, setMostrarForm] = useState(false);
  const [recarga, setRecarga] = useState(0); // al cambiar, vuelve a pedir el listado

  useEffect(() => {
    let activo = true;
    listarPedidos(filtro ? [filtro] : undefined)
      .then((datos) => {
        if (activo) setPedidos(datos);
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
  }, [filtro, recarga]);

  function cambiarFiltro(valor: EstadoPedido | '') {
    setFiltro(valor);
    setCargando(true);
    setError(null);
  }

  function alCrear() {
    setMostrarForm(false);
    setCargando(true);
    setError(null);
    setRecarga((n) => n + 1);
  }

  return (
    <div>
      <h2>Pedidos</h2>
            {puedeCrear && !mostrarForm && (
        <p>
          <button type="button" 
            className="boton--primario"
            onClick={() => setMostrarForm(true)}>
            Nuevo pedido
          </button>
        </p>
      )}
      {mostrarForm && (
        <NuevoPedidoForm onCreado={alCrear} onCancelar={() => setMostrarForm(false)} />
      )}
      <label>
        Estado:{' '}
        <select
          value={filtro}
          onChange={(e) => cambiarFiltro(e.target.value as EstadoPedido | '')}
        >
          <option value="">Todos</option>
          {ESTADOS_PEDIDO.map((estado) => (
            <option key={estado} value={estado}>
              {NOMBRE_ESTADO[estado]}
            </option>
          ))}
        </select>
      </label>

      {cargando && <p>Cargando pedidos…</p>}
      {error && <p>No se pudieron cargar los pedidos: {error}</p>}

      {!cargando && !error && (
        <>
          {pedidos.length === 0 ? (
            <p>No hay pedidos para mostrar.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Ítems</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p._id}>
                    <td>
                       <Link to={`/pedidos/${p._id}`}>{p.cliente}</Link>
                    </td>
                    <td>{NOMBRE_ESTADO[p.estado]}</td>
                    <td>{p.items.length}</td>
                    <td>{formatoFecha.format(new Date(p.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}