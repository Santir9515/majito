import { useEffect, useRef } from 'react';

// Llama a `recargar` cada `intervaloMs` mientras la pestaña está visible,
// y también apenas el usuario vuelve a ella. Con la pestaña oculta no consulta.
export function useActualizacionPeriodica(recargar: () => void, intervaloMs = 20000) {
  // Se guarda la última versión de la función para no reiniciar el intervalo en cada render.
  const recargarRef = useRef(recargar);
  useEffect(() => {
    recargarRef.current = recargar;
  });

  useEffect(() => {
    const actualizarSiVisible = () => {
      if (document.visibilityState === 'visible') recargarRef.current();
    };
    const intervalo = window.setInterval(actualizarSiVisible, intervaloMs);
    document.addEventListener('visibilitychange', actualizarSiVisible);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', actualizarSiVisible);
    };
  }, [intervaloMs]);
}