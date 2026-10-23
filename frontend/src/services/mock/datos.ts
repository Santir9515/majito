// Datos de ejemplo (inventados) para desarrollar sin backend.
// Tienen el mismo formato que devuelve la API (ver Majito_API_Provisoria.md).

import type { CambioEstado, EstadoPedido, ItemPedido, Pedido, Producto } from '../../types';

// Ids falsos con el formato real (24 caracteres hexadecimales).
const oid = (n: number): string => n.toString(16).padStart(24, '0');

// Usuarios de prueba (uno por rol)
const VENDEDOR = oid(101);
const DEPOSITO = oid(102);
const ADMIN = oid(103);

// Simula la demora de la red.
export function simularLatencia(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- Productos ----------

const CER_001: Producto = {
  _id: oid(1),
  codigo: 'CER-001',
  nombre: 'Cerámico 45x45 Blanco Mate',
  categoria: 'Cerámicos',
  precio: 8500,
  stockActual: 1200,
  activo: true,
};
const CER_002: Producto = {
  _id: oid(2),
  codigo: 'CER-002',
  nombre: 'Cerámico 36x36 Gris Piedra',
  categoria: 'Cerámicos',
  precio: 7200,
  stockActual: 640,
  activo: true,
};
const POR_001: Producto = {
  _id: oid(3),
  codigo: 'POR-001',
  nombre: 'Porcelanato 60x60 Símil Mármol',
  categoria: 'Porcelanatos',
  precio: 15900,
  stockActual: 380,
  activo: true,
};
const ADH_001: Producto = {
  _id: oid(4),
  codigo: 'ADH-001',
  nombre: 'Adhesivo cementicio 25 kg',
  categoria: 'Adhesivos',
  precio: 6300,
  stockActual: 210,
  activo: true,
};
const PAS_001: Producto = {
  _id: oid(5),
  codigo: 'PAS-001',
  nombre: 'Pastina Gris 1 kg',
  categoria: 'Pastinas',
  precio: 1450,
  stockActual: 0, // sin stock, para probar el aviso
  activo: true,
};
const ZOC_001: Producto = {
  _id: oid(6),
  codigo: 'ZOC-001',
  nombre: 'Zócalo 10x45 Blanco',
  categoria: 'Zócalos',
  precio: 2100,
  stockActual: 150,
  activo: false, // inactivo, para probar que no se ofrece al crear pedidos
};

export const PRODUCTOS: Producto[] = [CER_001, CER_002, POR_001, ADH_001, PAS_001, ZOC_001];

// ---------- Pedidos ----------

const item = (p: Producto, cantidad: number): ItemPedido => ({
  productoId: p._id,
  productoNombre: p.nombre,
  productoCodigo: p.codigo,
  cantidad,
});

const paso = (
  estado: EstadoPedido,
  usuario: string,
  fecha: string,
  motivo?: string,
): CambioEstado => (motivo ? { estado, usuario, fecha, motivo } : { estado, usuario, fecha });

// #9: pedido rechazado con 2 reemplazos (#1 y #2)
const PEDIDO_RECHAZADO_ID = oid(209);
const REEMPLAZO_1_ID = oid(201);
const REEMPLAZO_2_ID = oid(202);

export const PEDIDOS: Pedido[] = [
  {
    _id: REEMPLAZO_1_ID,
    cliente: 'Obras del Sur SA',
    items: [item(CER_002, 300)],
    estado: 'creado',
    notas: 'Reemplazo del pedido rechazado (sin la pastina)',
    creadoPor: VENDEDOR,
    historial: [paso('creado', VENDEDOR, '2026-10-14T11:00:00.000Z')],
    ticketOrigenId: PEDIDO_RECHAZADO_ID,
    ticketsReemplazoIds: [],
    createdAt: '2026-10-14T11:00:00.000Z',
    updatedAt: '2026-10-14T11:00:00.000Z',
  },
  {
    _id: REEMPLAZO_2_ID,
    cliente: 'Obras del Sur SA',
    items: [item(PAS_001, 50)],
    estado: 'en_revision',
    notas: 'Reemplazo: la pastina se entrega cuando haya stock',
    creadoPor: VENDEDOR,
    historial: [
      paso('creado', VENDEDOR, '2026-10-14T11:05:00.000Z'),
      paso('en_revision', ADMIN, '2026-10-14T15:00:00.000Z'),
    ],
    ticketOrigenId: PEDIDO_RECHAZADO_ID,
    ticketsReemplazoIds: [],
    createdAt: '2026-10-14T11:05:00.000Z',
    updatedAt: '2026-10-14T15:00:00.000Z',
  },
  {
    _id: oid(203),
    cliente: 'Constructora Delta SRL',
    items: [item(CER_002, 100), item(POR_001, 60), item(ADH_001, 40)],
    estado: 'en_preparacion',
    notas: 'Embalar en pallet',
    creadoPor: VENDEDOR,
    historial: [
      paso('creado', VENDEDOR, '2026-10-16T10:00:00.000Z'),
      paso('en_revision', ADMIN, '2026-10-16T11:30:00.000Z'),
      paso('en_preparacion', DEPOSITO, '2026-10-17T09:00:00.000Z'),
    ],
    ticketsReemplazoIds: [],
    createdAt: '2026-10-16T10:00:00.000Z',
    updatedAt: '2026-10-17T09:00:00.000Z',
  },
  {
    _id: oid(204),
    cliente: 'Corralón Don Pepe',
    items: [item(CER_002, 50), item(ADH_001, 25)],
    estado: 'listo_para_facturar',
    creadoPor: VENDEDOR,
    historial: [
      paso('creado', VENDEDOR, '2026-10-15T09:20:00.000Z'),
      paso('en_revision', ADMIN, '2026-10-15T10:10:00.000Z'),
      paso('en_preparacion', DEPOSITO, '2026-10-15T14:00:00.000Z'),
      paso('listo_para_facturar', DEPOSITO, '2026-10-17T11:45:00.000Z'),
    ],
    ticketsReemplazoIds: [],
    createdAt: '2026-10-15T09:20:00.000Z',
    updatedAt: '2026-10-17T11:45:00.000Z',
  },
  {
    _id: oid(205),
    cliente: 'Hogar & Diseño',
    items: [item(POR_001, 30)],
    estado: 'facturado',
    creadoPor: VENDEDOR,
    historial: [
      paso('creado', VENDEDOR, '2026-10-14T08:40:00.000Z'),
      paso('en_revision', ADMIN, '2026-10-14T09:30:00.000Z'),
      paso('en_preparacion', DEPOSITO, '2026-10-14T13:00:00.000Z'),
      paso('listo_para_facturar', DEPOSITO, '2026-10-15T10:00:00.000Z'),
      paso('facturado', ADMIN, '2026-10-16T16:20:00.000Z'),
    ],
    ticketsReemplazoIds: [],
    createdAt: '2026-10-14T08:40:00.000Z',
    updatedAt: '2026-10-16T16:20:00.000Z',
  },
  {
    _id: oid(206),
    cliente: 'Juan Pérez',
    items: [item(CER_001, 40)],
    estado: 'entregado',
    creadoPor: VENDEDOR,
    historial: [
      paso('creado', VENDEDOR, '2026-10-09T10:00:00.000Z'),
      paso('en_revision', ADMIN, '2026-10-09T11:00:00.000Z'),
      paso('en_preparacion', DEPOSITO, '2026-10-09T15:00:00.000Z'),
      paso('listo_para_facturar', DEPOSITO, '2026-10-10T09:00:00.000Z'),
      paso('facturado', ADMIN, '2026-10-10T12:00:00.000Z'),
      paso('entregado', DEPOSITO, '2026-10-13T10:30:00.000Z'),
    ],
    ticketsReemplazoIds: [],
    createdAt: '2026-10-09T10:00:00.000Z',
    updatedAt: '2026-10-13T10:30:00.000Z',
  },
  {
    _id: oid(207),
    cliente: 'Barraca Los Andes',
    items: [item(CER_001, 200)],
    estado: 'cerrado',
    creadoPor: VENDEDOR,
    historial: [
      paso('creado', VENDEDOR, '2026-10-05T09:00:00.000Z'),
      paso('en_revision', ADMIN, '2026-10-05T10:00:00.000Z'),
      paso('en_preparacion', DEPOSITO, '2026-10-05T14:00:00.000Z'),
      paso('listo_para_facturar', DEPOSITO, '2026-10-06T09:00:00.000Z'),
      paso('facturado', ADMIN, '2026-10-06T12:00:00.000Z'),
      paso('entregado', DEPOSITO, '2026-10-08T11:00:00.000Z'),
      paso('cerrado', ADMIN, '2026-10-09T09:30:00.000Z'),
    ],
    ticketsReemplazoIds: [],
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-09T09:30:00.000Z',
  },
  {
    _id: oid(208),
    cliente: 'Ferretería El Tornillo',
    items: [item(ADH_001, 15)],
    estado: 'anulado',
    notas: 'Pago por adelantado',
    creadoPor: VENDEDOR,
    historial: [
      paso('creado', VENDEDOR, '2026-10-12T10:00:00.000Z'),
      paso('anulado', ADMIN, '2026-10-12T16:00:00.000Z', 'Pedido cancelado por el cliente'),
    ],
    motivoAnulacion: 'Pedido cancelado por el cliente',
    ticketsReemplazoIds: [],
    createdAt: '2026-10-12T10:00:00.000Z',
    updatedAt: '2026-10-12T16:00:00.000Z',
  },
  {
    _id: PEDIDO_RECHAZADO_ID,
    cliente: 'Obras del Sur SA',
    items: [item(CER_002, 300), item(PAS_001, 50)],
    estado: 'rechazado',
    creadoPor: VENDEDOR,
    historial: [
      paso('creado', VENDEDOR, '2026-10-13T14:00:00.000Z'),
      paso('en_revision', ADMIN, '2026-10-13T16:30:00.000Z'),
      paso('rechazado', DEPOSITO, '2026-10-14T09:15:00.000Z', 'Falta de stock de pastina'),
    ],
    motivoRechazo: 'Falta de stock de pastina',
    ticketsReemplazoIds: [REEMPLAZO_1_ID, REEMPLAZO_2_ID],
    createdAt: '2026-10-13T14:00:00.000Z',
    updatedAt: '2026-10-14T11:05:00.000Z',
  },
];
