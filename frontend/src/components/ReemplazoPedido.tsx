import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pedido, Producto } from '../types';
import { listarProductos } from '../services/productosService';
import { crearReemplazo } from '../services/pedidosService';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import { puedeCrearReemplazo } from '../utils/accionesPedido';

interface Renglon {
  productoId: string;
  cantidad: number;
}

interface Props {
  pedido: Pedido; // el pedido rechazado
}

export default function ReemplazoPedido({ pedido }: Props) {
  const { usuario } = useUsuarioActual();
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  // Arranca con los ítems del pedido rechazado, para que se puedan ajustar.
  const [renglones, setRenglones] = useState<Renglon[]>(
    pedido.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
  );
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    let activo = true;
    listarProductos()
      .then((datos) => {
        if (activo) setProductos(datos.filter((p) => p.activo));
      })
      .catch((e: Error) => {
        if (activo) setError(e.message);
      });
    return () => {
      activo = false;
    };
  }, [abierto]);

  if (!puedeCrearReemplazo(pedido, usuario.rol)) return null;

  function cambiarRenglon(indice: number, cambio: Partial<Renglon>) {
    setRenglones((actuales) => actuales.map((r, i) => (i === indice ? { ...r, ...cambio } : r)));
  }

  function quitarRenglon(indice: number) {
    setRenglones((actuales) => actuales.filter((_, i) => i !== indice));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (renglones.length === 0) {
      setError('El reemplazo necesita al menos un ítem.');
      return;
    }
    if (renglones.some((r) => !r.productoId || !Number.isInteger(r.cantidad) || r.cantidad < 1)) {
      setError('Cada ítem necesita un producto y una cantidad entera mayor a cero.');
      return;
    }

    setGuardando(true);
    try {
      const nuevo = await crearReemplazo(pedido._id, {
        creadoPor: usuario.id,
        items: renglones,
        notas: notas.trim() || undefined,
      });
      navigate(`/pedidos/${nuevo._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el reemplazo.');
    } finally {
      setGuardando(false);
    }
  }

  if (!abierto) {
    return (
      <p>
        <button type="button" className="boton--primario" onClick={() => setAbierto(true)}>
          Crear pedido de reemplazo
        </button>
      </p>
    );
  }

  return (
    <form onSubmit={enviar}>
      <h3>Pedido de reemplazo</h3>

      {renglones.map((r, i) => (
        <p key={i}>
          <select
            value={r.productoId}
            onChange={(e) => cambiarRenglon(i, { productoId: e.target.value })}
          >
            <option value="">Elegí un producto…</option>
            {productos.map((p) => (
              <option key={p._id} value={p._id}>
                {p.codigo} — {p.nombre}
              </option>
            ))}
          </select>{' '}
          <input
            type="number"
            min={1}
            value={r.cantidad}
            onChange={(e) => cambiarRenglon(i, { cantidad: Number(e.target.value) })}
            style={{ width: '5rem' }}
          />{' '}
          <button type="button" onClick={() => quitarRenglon(i)}>
            Quitar
          </button>
        </p>
      ))}

      <p>
        <button
          type="button"
          onClick={() => setRenglones((a) => [...a, { productoId: '', cantidad: 1 }])}
        >
          Agregar ítem
        </button>
      </p>

      <p>
        <label>
          Notas (opcional): <input value={notas} onChange={(e) => setNotas(e.target.value)} />
        </label>
      </p>

      {error && <p>{error}</p>}

      <button type="submit" className="boton--primario" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Crear reemplazo'}
      </button>{' '}
      <button type="button" onClick={() => setAbierto(false)} disabled={guardando}>
        Cancelar
      </button>
    </form>
  );
}