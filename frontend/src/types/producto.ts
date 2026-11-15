export interface Producto {
  _id: string;
  codigo: string;
  nombre: string;
  categoria?: string;
  precio?: number; // precio de lista
  precioCosto?: number; // precio de costo: el backend solo lo envía a Administración
  stockActual: number;
  activo: boolean;
}
