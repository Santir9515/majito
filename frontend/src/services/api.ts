// Cliente HTTP mínimo para hablar con el backend.
// En producción se define VITE_API_URL; en desarrollo, Vite reenvía /api/* al backend local.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function pedirJSON<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    // fetch solo falla así cuando no hay conexión con el servidor (por ejemplo, backend apagado).
    throw new Error('No se pudo conectar con el servidor');
  }
  
  if (!respuesta.ok) {
    // Con el proxy de Vite, si el backend está apagado responde 502/503/504 en vez de fallar el fetch.
    if ([502, 503, 504].includes(respuesta.status)) {
      throw new Error('No se pudo conectar con el servidor');
    }
    // El backend devuelve el detalle del error en `message` (texto o lista de textos).
    let mensaje = `Error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      if (cuerpo?.message) {
        mensaje = Array.isArray(cuerpo.message) ? cuerpo.message.join(', ') : cuerpo.message;
      }
    } catch {
      // La respuesta no traía JSON: nos quedamos con el mensaje genérico.
    }
    throw new Error(mensaje);
  }

  return respuesta.json() as Promise<T>;
}