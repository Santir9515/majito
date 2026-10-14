import { Role } from '../users/enums/role.enum';
import { EstadoTicket } from './enums/estado-ticket.enum';

interface Transicion {
  siguiente: EstadoTicket;
  roles: Role[];
}

// Flujo lineal (RF-06). Los estados terminales (cerrado, anulado, rechazado)
// no tienen entrada: desde ahí no se puede avanzar.
export const TRANSICIONES: Partial<Record<EstadoTicket, Transicion>> = {
  [EstadoTicket.CREADO]: {
    siguiente: EstadoTicket.EN_REVISION,
    roles: [Role.ADMINISTRACION],
  },
  [EstadoTicket.EN_REVISION]: {
    siguiente: EstadoTicket.EN_PREPARACION,
    roles: [Role.DEPOSITO, Role.ADMINISTRACION],
  },
  [EstadoTicket.EN_PREPARACION]: {
    siguiente: EstadoTicket.LISTO_PARA_FACTURAR,
    roles: [Role.DEPOSITO, Role.ADMINISTRACION],
  },
  [EstadoTicket.LISTO_PARA_FACTURAR]: {
    siguiente: EstadoTicket.FACTURADO,
    roles: [Role.ADMINISTRACION],
  },
  [EstadoTicket.FACTURADO]: {
    siguiente: EstadoTicket.ENTREGADO,
    roles: [Role.DEPOSITO, Role.ADMINISTRACION],
  },
  [EstadoTicket.ENTREGADO]: {
    siguiente: EstadoTicket.CERRADO,
    roles: [Role.ADMINISTRACION],
  },
};

export const ESTADOS_ANULABLES: EstadoTicket[] = [
  EstadoTicket.CREADO,
  EstadoTicket.EN_REVISION,
  EstadoTicket.EN_PREPARACION,
  EstadoTicket.LISTO_PARA_FACTURAR,
  EstadoTicket.FACTURADO,
];

export const ROLES_ANULAR: Role[] = [Role.ADMINISTRACION];

// Rechazo (RF-08): hasta "listo para facturar" inclusive.
export const ESTADOS_RECHAZABLES: EstadoTicket[] = [
  EstadoTicket.CREADO,
  EstadoTicket.EN_REVISION,
  EstadoTicket.EN_PREPARACION,
  EstadoTicket.LISTO_PARA_FACTURAR,
];

export const ROLES_RECHAZAR: Role[] = [Role.DEPOSITO, Role.ADMINISTRACION];

export const ROLES_CREAR_REEMPLAZO: Role[] = [
  Role.VENDEDOR,
  Role.ADMINISTRACION,
];