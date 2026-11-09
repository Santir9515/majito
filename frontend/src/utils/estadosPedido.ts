import type { EstadoPedido } from '../types';

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  'creado',
  'en_revision',
  'en_preparacion',
  'listo_para_facturar',
  'facturado',
  'entregado',
  'cerrado',
  'anulado',
  'rechazado',
];

export const NOMBRE_ESTADO: Record<EstadoPedido, string> = {
  creado: 'Creado',
  en_revision: 'En revisión',
  en_preparacion: 'En preparación',
  listo_para_facturar: 'Listo para facturar',
  facturado: 'Facturado',
  entregado: 'Entregado',
  cerrado: 'Cerrado',
  anulado: 'Anulado',
  rechazado: 'Rechazado',
};