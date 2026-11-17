import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Producto } from '../types';
import { listarProductos } from '../services/productosService';
import { crearPedido } from '../services/pedidosService';
import { useUsuarioActual } from '../hooks/useUsuarioActual';

interface Renglon {
  productoId: string;
  cantidad: number;
}

interface Props {
  onCreado: () => void;
  onCancelar: () => void;
}

const RENGLON_VACIO: Renglon = { productoId: '', cantidad: 1 };

export default function NuevoPedidoForm({ onCreado, onCancelar }: Props) {
  const { usuario } = useUsuarioActual();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cliente, setCliente] = useState('');
  const [notas, setNotas] = useState('');
  const [renglones, setRenglones] = useState<Renglon[]>([RENGLON_VACIO]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    listarProductos()
      .then((datos) => {
        // Solo se pueden pedir productos activos.
        if (activo) setProductos(datos.filter((p) => p.activo));
      })
      .catch((e: Error) => {
        if (activo) setError(e.message);
      });
    return () => {
      activo = false;
    };
  }, []);

  function cambiarRenglon(indice: number, cambio: Partial<Renglon>) {
    setRenglones((actuales) => actuales.map((r, i) => (i === indice ? { ...r, ...cambio } : r)));
  }

  function quitarRenglon(indice: number) {
    setRenglones((actuales) => actuales.filter((_, i) => i !== indice));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cliente.trim()) {
      setError('Ingresá el nombre del cliente.');
      return;
    }
    if (renglones.some((r) => !r.productoId || !Number.isInteger(r.cantidad) || r.cantidad < 1)) {
      setError('Cada ítem necesita un producto y una cantidad entera mayor a cero.');
      return;
    }

    setGuardando(true);
    try {
      await crearPedido({
        cliente: cliente.trim(),
        items: renglones,
        notas: notas.trim() || undefined,
        creadoPor: usuario.id,
      });
      onCreado();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el pedido.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar}>
      <h3>Nuevo pedido</h3>
      <p>
        <label>
          Cliente: <input value={cliente} onChange={(e) => setCliente(e.target.value)} />
        </label>
      </p>

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
          {renglones.length > 1 && (
            <button type="button" onClick={() => quitarRenglon(i)}>
              Quitar
            </button>
          )}
        </p>
      ))}

      <p>
        <button type="button" onClick={() => setRenglones((a) => [...a, RENGLON_VACIO])}>
          Agregar ítem
        </button>
      </p>

      <p>
        <label>
          Notas (opcional): <input value={notas} onChange={(e) => setNotas(e.target.value)} />
        </label>
      </p>

      {error && <p>{error}</p>}

      <button type="submit" 
        className="boton--primario" 
        disabled={guardando}>
        {guardando ? 'Guardando…' : 'Crear pedido'}
      </button>{' '}
      <button type="button" onClick={onCancelar} disabled={guardando}>
        Cancelar
      </button>
    </form>
  );
}