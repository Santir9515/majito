export interface Producto {
  _id: string;
  codigo: string;
  nombre: string;
  categoria?: string;
  precio: number; // precio de lista
  stockActual: number;
  activo: boolean;
}
