import { NavLink, Outlet } from 'react-router-dom';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import { ETIQUETA_ROL, seccionesPara } from '../utils/permisos';

export default function MainLayout() {
  const { usuario, cerrarSesion } = useUsuarioActual();
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
          <p>{usuario.nombre}</p>
          <p>{ETIQUETA_ROL[usuario.rol]}</p>
          <button type="button" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="layout__contenido">
        <Outlet />
      </main>
    </div>
  );
}
