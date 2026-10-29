import type { UsuarioActual } from '../context/UsuarioActualContext';
import { ADMIN, DEPOSITO, VENDEDOR, simularLatencia } from './mock/datos';

// SERVICIO MOCK: valida el login contra usuarios de prueba.
// Cuando el backend tenga login, solo cambia el interior de iniciarSesion:
// pasa a llamar a POST /api/auth/login con { email, password } y a devolver
// el usuario (y guardar el token). Las pantallas no se tocan.

interface CredencialPrueba {
  email: string;
  password: string;
  usuario: UsuarioActual;
}

// Datos inventados, solo para desarrollo. Los ids son los mismos que usan los pedidos de ejemplo.
export const CREDENCIALES_PRUEBA: CredencialPrueba[] = [
  {
    email: 'vendedor@majito.test',
    password: 'vendedor123',
    usuario: { id: VENDEDOR, nombre: 'Vendedor de prueba', rol: 'vendedor' },
  },
  {
    email: 'deposito@majito.test',
    password: 'deposito123',
    usuario: { id: DEPOSITO, nombre: 'Depósito de prueba', rol: 'deposito' },
  },
  {
    email: 'admin@majito.test',
    password: 'admin123',
    usuario: { id: ADMIN, nombre: 'Administración de prueba', rol: 'administracion' },
  },
];

export async function iniciarSesion(email: string, password: string): Promise<UsuarioActual> {
  await simularLatencia();
  const emailNormalizado = email.trim().toLowerCase();
  const encontrada = CREDENCIALES_PRUEBA.find(
    (c) => c.email === emailNormalizado && c.password === password,
  );
  if (!encontrada) {
    throw new Error('Email o contraseña incorrectos');
  }
  return { ...encontrada.usuario };
}
