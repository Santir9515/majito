import { NavLink, Outlet } from 'react-router-dom';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import { ETIQUETA_ROL, seccionesPara } from '../utils/permisos';
import type { Rol } from '../types';

export default function MainLayout() {
  const { usuario, cambiarRol } = useUsuarioActual();
  const secciones = seccionesPara(usuario.rol);

  return (
    <div className="layout">
      <aside className="layout__lateral">
        <h1 className="layout__marca">Majito</h1>

        <nav className="layout__nav">
          {secciones.map((s) => (
            <NavLink
              key={s.ruta}
              to={s.ruta}
              className={({ isActive }) =>
                isActive ? 'layout__enlace layout__enlace--activo' : 'layout__enlace'
              }
            >
              {s.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="layout__usuario">
          <label htmlFor="rol-prueba">Rol (solo desarrollo)</label>
          <select
            id="rol-prueba"
            value={usuario.rol}
            onChange={(e) => cambiarRol(e.target.value as Rol)}
          >
            {(Object.keys(ETIQUETA_ROL) as Rol[]).map((rol) => (
              <option key={rol} value={rol}>
                {ETIQUETA_ROL[rol]}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <main className="layout__contenido">
        <Outlet />
      </main>
    </div>
  );
}
