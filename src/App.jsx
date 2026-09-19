import React, { useMemo, useState } from 'react';
import { useApp } from './state/store.jsx';
import { NavContext, SesionContext } from './state/nav.jsx';
import { revisionesPendientes, tropa as buscarTropa } from './state/logica.js';
import { Avatar } from './components/comunes.jsx';

import Ingreso from './views/Ingreso.jsx';
import MiCuenta from './views/MiCuenta.jsx';
import Aprende from './views/Aprende.jsx';
import TrabajoDetalle from './views/TrabajoDetalle.jsx';
import InicioScout from './views/scout/InicioScout.jsx';
import Explorar from './views/scout/Explorar.jsx';
import MiPatrulla from './views/scout/MiPatrulla.jsx';
import InicioJefe from './views/jefe/InicioJefe.jsx';
import Revisiones from './views/jefe/Revisiones.jsx';
import ScoutDetalle from './views/jefe/ScoutDetalle.jsx';
import Gestion from './views/jefe/Gestion.jsx';
import AdminTropas from './views/admin/AdminTropas.jsx';
import AdminUsuarios from './views/admin/AdminUsuarios.jsx';
import AdminDatos from './views/admin/AdminDatos.jsx';

export default function App() {
  const { usuario, cargando, salir } = useApp();
  const [vista, setVista] = useState({ v: 'inicio' });

  function navegar(nuevaVista) {
    setVista(nuevaVista);
    window.scrollTo({ top: 0 });
  }

  const nav = useMemo(() => ({ vista, navegar }), [vista]);
  const sesion = useMemo(
    () => ({
      usuario,
      salir: () => {
        setVista({ v: 'inicio' });
        salir();
      },
    }),
    [usuario, salir]
  );

  if (cargando) {
    return (
      <div className="vacio" style={{ paddingTop: '30vh' }}>
        <div className="vacio-icono">⚜️</div>
        <p className="suave">Cargando…</p>
      </div>
    );
  }

  if (!usuario) {
    return <Ingreso />;
  }

  return (
    <NavContext.Provider value={nav}>
      <SesionContext.Provider value={sesion}>
        <Cascaron />
      </SesionContext.Provider>
    </NavContext.Provider>
  );
}

const SUBTITULO_ROL = { admin: 'Administración', jefe: 'Dirigente', scout: '' };

function Cascaron() {
  const { state } = useApp();
  const { vista, navegar } = React.useContext(NavContext);
  const { usuario } = React.useContext(SesionContext);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);

  const rol = usuario.rol;
  const miTropa = rol === 'admin' ? null : buscarTropa(state, usuario.tropaId);
  const pendientes = rol === 'jefe' ? revisionesPendientes(state, usuario.tropaId).length : 0;

  function alVolverDeTrabajo() {
    switch (vista.desde) {
      case 'explorar':
        navegar({ v: 'explorar', rutaId: vista.rutaId || null });
        break;
      case 'revisiones':
        navegar({ v: 'revisiones' });
        break;
      case 'scout-detalle':
        navegar({ v: 'scout-detalle', scoutId: vista.scoutId });
        break;
      default:
        navegar({ v: 'inicio' });
    }
  }

  let contenido;
  if (rol === 'admin') {
    switch (vista.v) {
      case 'admin-usuarios':
        contenido = <AdminUsuarios />;
        break;
      case 'admin-datos':
        contenido = <AdminDatos />;
        break;
      case 'aprende':
        contenido = <Aprende />;
        break;
      default:
        contenido = <AdminTropas />;
    }
  } else if (rol === 'jefe') {
    switch (vista.v) {
      case 'revisiones':
        contenido = <Revisiones />;
        break;
      case 'gestion':
        contenido = <Gestion />;
        break;
      case 'aprende':
        contenido = <Aprende />;
        break;
      case 'trabajo':
        contenido = <TrabajoDetalle trabajoId={vista.trabajoId} alVolver={alVolverDeTrabajo} />;
        break;
      case 'scout-detalle':
        contenido = <ScoutDetalle scoutId={vista.scoutId} />;
        break;
      default:
        contenido = <InicioJefe />;
    }
  } else {
    switch (vista.v) {
      case 'explorar':
        contenido = <Explorar rutaId={vista.rutaId || null} />;
        break;
      case 'patrulla':
        contenido = <MiPatrulla />;
        break;
      case 'aprende':
        contenido = <Aprende />;
        break;
      case 'trabajo':
        contenido = <TrabajoDetalle trabajoId={vista.trabajoId} alVolver={alVolverDeTrabajo} />;
        break;
      default:
        contenido = <InicioScout />;
    }
  }

  const pestanasScout = [
    { v: 'inicio', icono: '🏠', texto: 'Mi diario' },
    { v: 'explorar', icono: '🗺️', texto: 'Explorar' },
    { v: 'patrulla', icono: '⛺', texto: 'Patrulla' },
    { v: 'aprende', icono: '📖', texto: 'Aprende' },
  ];
  const pestanasJefe = [
    { v: 'inicio', icono: '🏕️', texto: 'Tropa' },
    { v: 'revisiones', icono: '✅', texto: 'Revisiones', marca: pendientes },
    { v: 'gestion', icono: '⚙️', texto: 'Gestión' },
    { v: 'aprende', icono: '📖', texto: 'Aprende' },
  ];
  const pestanasAdmin = [
    { v: 'inicio', icono: '🏕️', texto: 'Tropas' },
    { v: 'admin-usuarios', icono: '👥', texto: 'Usuarios' },
    { v: 'admin-datos', icono: '💾', texto: 'Datos' },
    { v: 'aprende', icono: '📖', texto: 'Aprende' },
  ];
  const pestanas = rol === 'admin' ? pestanasAdmin : rol === 'jefe' ? pestanasJefe : pestanasScout;

  // Resaltar la pestaña "madre" cuando se está en una vista de detalle
  const activa =
    vista.v === 'trabajo'
      ? vista.desde === 'revisiones'
        ? 'revisiones'
        : vista.desde === 'explorar'
          ? 'explorar'
          : 'inicio'
      : vista.v === 'scout-detalle'
        ? 'inicio'
        : vista.v;

  return (
    <div className="app">
      <header className="cabecera">
        <div className="titulo">
          ⚜️
          <div style={{ minWidth: 0 }}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Diario de Exploración
            </div>
            <small>
              {rol === 'admin'
                ? SUBTITULO_ROL.admin
                : `${miTropa?.nombre || ''}${rol === 'jefe' ? ' · Dirigente' : ''}`}
            </small>
          </div>
        </div>
        <button onClick={() => setCuentaAbierta(true)} title="Mi cuenta">
          <Avatar usuario={usuario} tam={26} />
          <span className="pequeno">{usuario.nombre.split(' ')[0]}</span>
        </button>
      </header>

      <main>{contenido}</main>

      <nav className="nav">
        {pestanas.map((p) => (
          <button
            key={p.v}
            className={activa === p.v ? 'activo' : ''}
            onClick={() => navegar({ v: p.v })}
          >
            {Boolean(p.marca) && <span className="marca">{p.marca}</span>}
            <span className="nav-icono">{p.icono}</span>
            {p.texto}
          </button>
        ))}
      </nav>

      {cuentaAbierta && <MiCuenta abierto={cuentaAbierta} onCerrar={() => setCuentaAbierta(false)} />}
    </div>
  );
}
