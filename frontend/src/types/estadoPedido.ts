export type EstadoPedido =
  | 'creado'
  | 'en_revision'
  | 'en_preparacion'
  | 'listo_para_facturar'
  | 'facturado'
  | 'entregado'
  | 'cerrado'
  | 'anulado'
  | 'rechazado';