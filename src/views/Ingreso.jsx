import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/store.jsx';

/**
 * Ingreso a la aplicación (Supabase):
 * - Sin configuración de Supabase: instrucciones.
 * - Sin usuarios: configuración inicial (primer administrador).
 * - Iniciar sesión con correo/usuario y contraseña.
 * - Crear cuenta con un código de invitación de la tropa (scout o dirigente).
 */
export default function Ingreso() {
  const { configurado, hayUsuarios } = useApp();
  const [modo, setModo] = useState('cargando'); // cargando | setup | login | registro

  useEffect(() => {
    if (!configurado) return;
    let activo = true;
    hayUsuarios()
      .then((hay) => activo && setModo(hay ? 'login' : 'setup'))
      .catch(() => activo && setModo('login'));
    return () => {
      activo = false;
    };
  }, [configurado, hayUsuarios]);

  if (!configurado) return <SinConfiguracion />;

  return (
    <div className="ingreso">
      <Encabezado />
      {modo === 'cargando' && <p className="centrado suave">Conectando…</p>}
      {modo === 'setup' && <ConfiguracionInicial />}
      {modo === 'login' && <FormularioLogin alRegistro={() => setModo('registro')} />}
      {modo === 'registro' && <FormularioRegistro alLogin={() => setModo('login')} />}
    </div>
  );
}

function Encabezado() {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="ingreso-logo">
      <img
        className="logo-asociacion"
        src={`${base}marca/scouts-colombia.png`}
        alt="Scouts de Colombia"
        draggable={false}
      />
      <h1>Diario de Exploración</h1>
      <p className="suave sin-margen">Progresión personal · Rama Scout</p>
      <img
        className="logo-gran-juego"
        src={`${base}marca/gran-juego.png`}
        alt="El Gran Juego para la Vida"
        draggable={false}
      />
    </div>
  );
}

function SinConfiguracion() {
  return (
    <div className="ingreso">
      <Encabezado />
      <div className="tarjeta">
        <h3>🔌 Falta conectar Supabase</h3>
        <p className="pequeno">
          La aplicación necesita un proyecto de Supabase. Crea el archivo{' '}
          <code>.env.local</code> en la raíz del proyecto con:
        </p>
        <pre style={{ background: '#f2efe6', padding: 12, borderRadius: 10, overflowX: 'auto' }}>
          {'VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co\nVITE_SUPABASE_ANON_KEY=TU-CLAVE-PUBLICA'}
        </pre>
        <p className="pequeno suave sin-margen">
          Los valores están en el panel de Supabase → Settings → API. Luego reinicia el servidor
          de desarrollo. Las instrucciones completas están en el archivo README.md.
        </p>
      </div>
    </div>
  );
}

function FormularioLogin({ alRegistro }) {
  const { ingresar } = useApp();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await ingresar(correo, contrasena);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="tarjeta" onSubmit={entrar}>
      <h3>Iniciar sesión</h3>
      <label htmlFor="ing-correo">Correo o usuario</label>
      <input
        id="ing-correo"
        autoFocus
        autoCapitalize="none"
        autoComplete="username"
        value={correo}
        onChange={(e) => {
          setCorreo(e.target.value);
          setError('');
        }}
        placeholder="ej: mateo.gomez"
      />
      <label htmlFor="ing-clave">Contraseña</label>
      <input
        id="ing-clave"
        type="password"
        autoComplete="current-password"
        value={contrasena}
        onChange={(e) => {
          setContrasena(e.target.value);
          setError('');
        }}
        placeholder="Tu contraseña"
      />
      {error && <p style={{ color: 'var(--rojo)' }} className="mt sin-margen">{error}</p>}
      <div className="fila-botones">
        <button className="btn" type="submit" disabled={enviando || !correo.trim() || !contrasena}>
          {enviando ? '⏳ Entrando…' : '🔑 Entrar'}
        </button>
      </div>
      <p className="pequeno suave mt">
        ¿No tienes cuenta?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alRegistro();
          }}
        >
          Crea una con el código de invitación de tu tropa
        </a>
        . Si olvidaste tu contraseña, pídele a tu dirigente que te asigne una nueva.
      </p>
    </form>
  );
}

function FormularioRegistro({ alLogin }) {
  const { registrarse, validarCodigo } = useApp();
  const [codigo, setCodigo] = useState('');
  const [invitacion, setInvitacion] = useState(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const verificacion = useRef(null);

  // Verificar el código contra el servidor con un pequeño freno
  useEffect(() => {
    setInvitacion(null);
    if (!codigo.trim()) return;
    clearTimeout(verificacion.current);
    verificacion.current = setTimeout(async () => {
      const res = await validarCodigo(codigo);
      setInvitacion(res);
    }, 350);
    return () => clearTimeout(verificacion.current);
  }, [codigo, validarCodigo]);

  async function registrar(e) {
    e.preventDefault();
    setError('');
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasena !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      await registrarse({ codigo, nombre: nombre.trim(), correo: correo.trim(), contrasena });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <form className="tarjeta" onSubmit={registrar}>
      <h3>Crear cuenta</h3>
      <p className="pequeno suave">
        Necesitas el <strong>código de invitación</strong> que te comparte el dirigente de tu
        tropa. El código define si entras como scout o como dirigente.
      </p>
      <label htmlFor="reg-codigo">Código de invitación</label>
      <input
        id="reg-codigo"
        autoFocus
        value={codigo}
        onChange={(e) => {
          setCodigo(e.target.value.toUpperCase());
          setError('');
        }}
        placeholder="Ej: CONDOR"
        style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}
      />
      {invitacion && (
        <p className="pequeno mt sin-margen" style={{ color: 'var(--verde)' }}>
          ✅ {invitacion.tropaNombre} — entrarás como{' '}
          <strong>{invitacion.rol === 'jefe' ? 'dirigente' : 'scout'}</strong>.
        </p>
      )}
      <label htmlFor="reg-nombre">Nombre completo</label>
      <input
        id="reg-nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Ej: Mateo Gómez"
        autoComplete="name"
      />
      <label htmlFor="reg-correo">Correo o usuario</label>
      <input
        id="reg-correo"
        autoCapitalize="none"
        value={correo}
        onChange={(e) => {
          setCorreo(e.target.value);
          setError('');
        }}
        placeholder="Con este dato iniciarás sesión"
        autoComplete="username"
      />
      <label htmlFor="reg-clave">Contraseña (mínimo 6 caracteres)</label>
      <input
        id="reg-clave"
        type="password"
        value={contrasena}
        onChange={(e) => {
          setContrasena(e.target.value);
          setError('');
        }}
        autoComplete="new-password"
      />
      <label htmlFor="reg-clave2">Repite la contraseña</label>
      <input
        id="reg-clave2"
        type="password"
        value={confirmacion}
        onChange={(e) => {
          setConfirmacion(e.target.value);
          setError('');
        }}
        autoComplete="new-password"
      />
      {error && <p style={{ color: 'var(--rojo)' }} className="mt sin-margen">{error}</p>}
      <div className="fila-botones">
        <button
          className="btn"
          type="submit"
          disabled={enviando || !codigo.trim() || !nombre.trim() || !correo.trim() || !contrasena || !confirmacion}
        >
          {enviando ? '⏳ Creando…' : '✨ Crear mi cuenta'}
        </button>
      </div>
      <p className="pequeno suave mt">
        ¿Ya tienes cuenta?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alLogin();
          }}
        >
          Inicia sesión
        </a>
        .
      </p>
    </form>
  );
}

function ConfiguracionInicial() {
  const { configuracionInicial } = useApp();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function crearAdmin(e) {
    e.preventDefault();
    setError('');
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasena !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      await configuracionInicial({ nombre: nombre.trim(), correo: correo.trim(), contrasena });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <form className="tarjeta" onSubmit={crearAdmin}>
      <h3>👋 Configuración inicial</h3>
      <p className="pequeno suave">
        Crea la cuenta de <strong>administrador de la aplicación</strong>. Con ella podrás crear
        tropas, obtener los códigos de invitación y gestionar todas las cuentas.
      </p>
      <label>Tu nombre</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
      <label>Correo o usuario</label>
      <input value={correo} autoCapitalize="none" onChange={(e) => setCorreo(e.target.value)} />
      <label>Contraseña (mínimo 6 caracteres)</label>
      <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
      <label>Repite la contraseña</label>
      <input type="password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} />
      {error && <p style={{ color: 'var(--rojo)' }} className="mt sin-margen">{error}</p>}
      <div className="fila-botones">
        <button
          className="btn"
          type="submit"
          disabled={enviando || !nombre.trim() || !correo.trim() || !contrasena || !confirmacion}
        >
          {enviando ? '⏳ Creando…' : '🛡️ Crear administrador'}
        </button>
      </div>
    </form>
  );
}
