import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Pedido } from '../types';
import { obtenerPedido } from '../services/pedidosService';
import { NOMBRE_ESTADO } from '../utils/estadosPedido';
import AccionesPedido from '../components/AccionesPedido';

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export default function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let activo = true;
    obtenerPedido(id)
      .then((dato) => {
        if (activo) setPedido(dato);
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
  }, [id]);

  return (
    <div>
      <p>
        <Link to="/pedidos">← Volver a Pedidos</Link>
      </p>
      <h2>Detalle del pedido</h2>

      {cargando && <p>Cargando pedido…</p>}
      {error && <p>No se pudo cargar el pedido: {error}</p>}

      {pedido && (
        <>
          <p><strong>Cliente:</strong> {pedido.cliente}</p>
          <p><strong>Estado:</strong> {NOMBRE_ESTADO[pedido.estado]}</p>
          <p><strong>Creado:</strong> {formatoFecha.format(new Date(pedido.createdAt))}</p>
          <p><strong>Última actualización:</strong> {formatoFecha.format(new Date(pedido.updatedAt))}</p>
          {pedido.notas && <p><strong>Notas:</strong> {pedido.notas}</p>}
          {pedido.motivoRechazo && <p><strong>Motivo de rechazo:</strong> {pedido.motivoRechazo}</p>}
          {pedido.motivoAnulacion && <p><strong>Motivo de anulación:</strong> {pedido.motivoAnulacion}</p>}
          <AccionesPedido pedido={pedido} onActualizado={setPedido} />
          <h3>Ítems</h3>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.productoCodigo}</td>
                  <td>{item.productoNombre}</td>
                  <td>{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Historial</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {pedido.historial.map((c, i) => (
                <tr key={i}>
                  <td>{formatoFecha.format(new Date(c.fecha))}</td>
                  <td>{NOMBRE_ESTADO[c.estado]}</td>
                  <td>{c.motivo ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}