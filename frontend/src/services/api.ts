// Cliente HTTP mínimo para hablar con el backend.
// En desarrollo, Vite reenvía /api/* a http://localhost:3000 (ver vite.config.ts).
const BASE_URL = '/api';

export async function pedirJSON<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });

  if (!respuesta.ok) {
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