export interface ItemPedido {
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  cantidad: number;
  precioUnitario?: number; // todavía no está en el backend
}