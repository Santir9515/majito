import { useState } from 'react';
import type { Pedido } from '../types';
import { anularPedido, avanzarPedido, rechazarPedido } from '../services/pedidosService';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import { puedeAnular, puedeRechazar, siguienteEstado } from '../utils/accionesPedido';
import { NOMBRE_ESTADO } from '../utils/estadosPedido';

interface Props {
  pedido: Pedido;
  onActualizado: (pedido: Pedido) => void;
}

type AccionConMotivo = 'rechazar' | 'anular';

export default function AccionesPedido({ pedido, onActualizado }: Props) {
  const { usuario } = useUsuarioActual();

  // Acción que está pidiendo el motivo (rechazar o anular), o null si no hay ninguna abierta.
  const [accion, setAccion] = useState<AccionConMotivo | null>(null);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siguiente = siguienteEstado(pedido, usuario.rol);
  const rechazable = puedeRechazar(pedido, usuario.rol);
  const anulable = puedeAnular(pedido, usuario.rol);

  if (!siguiente && !rechazable && !anulable) return null;

  async function ejecutar(operacion: () => Promise<Pedido>) {
    setEnviando(true);
    setError(null);
    try {
      onActualizado(await operacion());
      setAccion(null);
      setMotivo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la operación.');
    } finally {
      setEnviando(false);
    }
  }

  function confirmarConMotivo() {
    const texto = motivo.trim();
    if (!texto) {
      setError('El motivo es obligatorio.');
      return;
    }
    if (accion === 'rechazar') {
      void ejecutar(() => rechazarPedido(pedido._id, usuario.id, texto));
    } else {
      void ejecutar(() => anularPedido(pedido._id, usuario.id, texto));
    }
  }

  function abrir(nueva: AccionConMotivo) {
    setAccion(nueva);
    setMotivo('');
    setError(null);
  }

  return (
    <div>
      <h3>Acciones</h3>

      {accion === null ? (
        <p>
          {siguiente && (
            <button
              type="button"
              disabled={enviando}
              onClick={() => void ejecutar(() => avanzarPedido(pedido._id, usuario.id))}
            >
              {enviando ? 'Guardando…' : `Pasar a "${NOMBRE_ESTADO[siguiente]}"`}
            </button>
          )}{' '}
          {rechazable && (
            <button type="button" disabled={enviando} onClick={() => abrir('rechazar')}>
              Rechazar
            </button>
          )}{' '}
          {anulable && (
            <button type="button" disabled={enviando} onClick={() => abrir('anular')}>
              Anular
            </button>
          )}
        </p>
      ) : (
        <p>
          <label>
            Motivo para {accion}:{' '}
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </label>{' '}
          <button type="button" disabled={enviando} onClick={confirmarConMotivo}>
            {enviando ? 'Guardando…' : 'Confirmar'}
          </button>{' '}
          <button type="button" disabled={enviando} onClick={() => setAccion(null)}>
            Cancelar
          </button>
        </p>
      )}

      {error && <p>{error}</p>}
    </div>
  );
}