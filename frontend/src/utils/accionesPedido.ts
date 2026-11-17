import type { EstadoPedido, Pedido, Rol } from '../types';

interface Transicion {
  siguiente: EstadoPedido;
  roles: Rol[];
}

// Mismas reglas que backend/src/tickets/transiciones-estado.ts.
// Acá solo deciden qué botones se muestran: el backend vuelve a validar cada operación.
const TRANSICIONES: Partial<Record<EstadoPedido, Transicion>> = {
  creado: { siguiente: 'en_revision', roles: ['administracion'] },
  en_revision: { siguiente: 'en_preparacion', roles: ['deposito', 'administracion'] },
  en_preparacion: { siguiente: 'listo_para_facturar', roles: ['deposito', 'administracion'] },
  listo_para_facturar: { siguiente: 'facturado', roles: ['administracion'] },
  facturado: { siguiente: 'entregado', roles: ['deposito', 'administracion'] },
  entregado: { siguiente: 'cerrado', roles: ['administracion'] },
};

const ROLES_ANULAR: Rol[] = ['administracion'];
const ESTADOS_ANULABLES: EstadoPedido[] = [
  'creado',
  'en_revision',
  'en_preparacion',
  'listo_para_facturar',
  'facturado',
];

const ROLES_RECHAZAR: Rol[] = ['deposito', 'administracion'];
const ESTADOS_RECHAZABLES: EstadoPedido[] = [
  'creado',
  'en_revision',
  'en_preparacion',
  'listo_para_facturar',
];

// Estado al que el rol puede avanzar el pedido, o null si no puede avanzarlo.
export function siguienteEstado(pedido: Pedido, rol: Rol): EstadoPedido | null {
  const transicion = TRANSICIONES[pedido.estado];
  return transicion && transicion.roles.includes(rol) ? transicion.siguiente : null;
}

export function puedeRechazar(pedido: Pedido, rol: Rol): boolean {
  return ROLES_RECHAZAR.includes(rol) && ESTADOS_RECHAZABLES.includes(pedido.estado);
}

// Un rechazado se puede anular solo si no tiene pedidos de reemplazo.
export function puedeAnular(pedido: Pedido, rol: Rol): boolean {
  if (!ROLES_ANULAR.includes(rol)) return false;
  const rechazadoSinReemplazo =
    pedido.estado === 'rechazado' && pedido.ticketsReemplazoIds.length === 0;
  return ESTADOS_ANULABLES.includes(pedido.estado) || rechazadoSinReemplazo;
}

const ROLES_REEMPLAZO: Rol[] = ['vendedor', 'administracion'];

// Solo un pedido rechazado admite pedidos de reemplazo.
export function puedeCrearReemplazo(pedido: Pedido, rol: Rol): boolean {
  return pedido.estado === 'rechazado' && ROLES_REEMPLAZO.includes(rol);
}