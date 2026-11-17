import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Rol, Usuario } from '../types';
import { cambiarActivo, crearUsuario, listarUsuarios } from '../services/usuariosService';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import { ETIQUETA_ROL } from '../utils/permisos';

const ROLES = Object.keys(ETIQUETA_ROL) as Rol[];

// Panel de Administración: listado, alta y activación de usuarios (CU-17).
export default function UsuariosPage() {
  const { usuario: usuarioActual } = useUsuarioActual();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0); // al cambiar, vuelve a pedir el listado

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol>('vendedor');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    listarUsuarios()
      .then((datos) => {
        if (activo) {
          setUsuarios(datos);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [recarga]);

  function cerrarForm() {
    setMostrarForm(false);
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('vendedor');
    setErrorForm(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErrorForm(null);

    if (!nombre.trim() || !email.trim()) {
      setErrorForm('Completá el nombre y el email.');
      return;
    }
    if (password.length < 6) {
      setErrorForm('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      await crearUsuario({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        rol,
      });
      cerrarForm();
      setRecarga((n) => n + 1);
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'No se pudo crear el usuario.');
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(u: Usuario) {
    setError(null);
    try {
      await cambiarActivo(u._id, !u.activo);
      setRecarga((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario.');
    }
  }

  return (
    <div>
      <h2>Usuarios</h2>

      {!mostrarForm && (
        <p>
          <button type="button" className="boton--primario" onClick={() => setMostrarForm(true)}>
            Nuevo usuario
          </button>
        </p>
      )}

      {mostrarForm && (
        <form onSubmit={enviar}>
          <h3>Nuevo usuario</h3>
          <p>
            <label>
              Nombre: <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
          </p>
          <p>
            <label>
              Email:{' '}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </p>
          <p>
            <label>
              Contraseña (mínimo 6 caracteres):{' '}
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </p>
          <p>
            <label>
              Rol:{' '}
              <select value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ETIQUETA_ROL[r]}
                  </option>
                ))}
              </select>
            </label>
          </p>

          {errorForm && <p>{errorForm}</p>}

          <button type="submit" className="boton--primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Crear usuario'}
          </button>{' '}
          <button type="button" onClick={cerrarForm} disabled={guardando}>
            Cancelar
          </button>
        </form>
      )}

      {cargando && <p>Cargando usuarios…</p>}
      {error && <p>No se pudo completar la operación: {error}</p>}

      {!cargando && usuarios.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u._id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{ETIQUETA_ROL[u.rol]}</td>
                <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                  {u._id === usuarioActual.id ? (
                    '— (tu usuario)'
                  ) : (
                    <button
                      type="button"
                      className={u.activo ? 'boton--peligro' : undefined}
                      onClick={() => void alternarActivo(u)}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}