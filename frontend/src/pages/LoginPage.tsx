import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useSesion } from '../hooks/useSesion';
import { CREDENCIALES_PRUEBA, iniciarSesion as validarCredenciales } from '../services/authService';
import './LoginPage.css';

export default function LoginPage() {
  const { usuario, iniciarSesion } = useSesion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login.
  // Al iniciar sesión con éxito, este mismo chequeo redirige a Pedidos.
  if (usuario) {
    return <Navigate to="/pedidos" replace />;
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const usuarioValidado = await validarCredenciales(email, password);
      iniciarSesion(usuarioValidado);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión');
      setCargando(false);
    }
  }

  return (
    <main className="login">
      <div className="login__tarjeta">
        <h1 className="login__marca">Majito</h1>

        <form className="login__formulario" onSubmit={manejarEnvio}>
          <div className="login__campo">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={cargando}
            />
          </div>

          <div className="login__campo">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={cargando}
            />
          </div>

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login__boton" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {import.meta.env.DEV && (
          <section className="login__ayuda">
            <p>Usuarios de prueba (solo desarrollo):</p>
            <ul>
              {CREDENCIALES_PRUEBA.map((c) => (
                <li key={c.email}>
                  {c.usuario.nombre}: {c.email} / {c.password}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
