import React from 'react';
import { useApp } from '../../state/store.jsx';
import { useNav, useSesion } from '../../state/nav.jsx';
import { RUTAS, INSIGNIAS } from '../../data/progresion.js';
import {
  scoutsDeTropa,
  patrullasDeTropa,
  scoutsDePatrulla,
  resumenScout,
  revisionesPendientes,
  tropa as buscarTropa,
} from '../../state/logica.js';
import { Avatar, BarraProgreso, EscalonesRuta } from '../../components/comunes.jsx';

export default function InicioJefe() {
  const { state } = useApp();
  const { navegar } = useNav();
  const { usuario } = useSesion();

  const miTropa = buscarTropa(state, usuario.tropaId);
  const scouts = scoutsDeTropa(state, usuario.tropaId);
  const patrullas = patrullasDeTropa(state, usuario.tropaId);
  const pendientes = revisionesPendientes(state, usuario.tropaId);
  const resumenes = scouts.map((s) => ({ scout: s, resumen: resumenScout(state, s.id) }));
  const totalConquistas = resumenes.reduce((s, r) => s + r.resumen.conquistados, 0);

  const hace30 = new Date();
  hace30.setDate(hace30.getDate() - 30);
  const conquistasMes = state.trabajos.filter(
    (t) =>
      t.estado === 'conquistado' &&
      t.conquistadoEn &&
      new Date(t.conquistadoEn) > hace30 &&
      scouts.some((s) => s.id === t.scoutId)
  ).length;

  const insigniasConteo = INSIGNIAS.map((i) => ({
    insignia: i,
    n: resumenes.filter((r) => r.resumen.insignia?.id === i.id).length,
  }));

  const maxPatrulla = Math.max(
    1,
    ...patrullas.map((p) =>
      scoutsDePatrulla(state, p.id).reduce((s, m) => s + resumenScout(state, m.id).conquistados, 0)
    )
  );

  return (
    <div>
      <div className="tarjeta">
        <h2 className="sin-margen">🏕️ {miTropa?.nombre}</h2>
        {miTropa?.grupo && <p className="suave pequeno sin-margen">{miTropa.grupo}</p>}
        <div className="grid-3 mt">
          <Indicador valor={scouts.length} texto="Scouts" icono="🧑‍🤝‍🧑" />
          <Indicador
            valor={pendientes.length}
            texto="Por revisar"
            icono="⏳"
            alerta={pendientes.length > 0}
            onClick={() => navegar({ v: 'revisiones' })}
          />
          <Indicador valor={conquistasMes} texto="Conquistas últimos 30 días" icono="🚩" />
        </div>
      </div>

      {pendientes.length > 0 && (
        <div
          className="nota nota-ajustes tarjeta-clic"
          onClick={() => navegar({ v: 'revisiones' })}
          style={{ cursor: 'pointer' }}
        >
          ⏳ Tienes <strong>{pendientes.length}</strong> conquista{pendientes.length === 1 ? '' : 's'} esperando tu
          revisión. Toca para revisarlas.
        </div>
      )}

      <div className="seccion-titulo">
        <h2>🎖️ Insignias en la tropa</h2>
      </div>
      <div className="tarjeta">
        <div className="fila" style={{ justifyContent: 'space-around', flexWrap: 'wrap', gap: 14 }}>
          {insigniasConteo.map(({ insignia, n }) => (
            <div key={insignia.id} className="insignia-medalla">
              {insignia.imagen ? (
                <img
                  className="fase-imagen"
                  src={insignia.imagen}
                  alt={insignia.nombre}
                  style={n > 0 ? {} : { filter: 'grayscale(1)', opacity: 0.45 }}
                  draggable={false}
                />
              ) : (
                <span className="aro" style={{ borderColor: insignia.color, opacity: n > 0 ? 1 : 0.4 }}>
                  {insignia.icono}
                </span>
              )}
              <strong>{n}</strong>
              <span className="pequeno suave" style={{ maxWidth: 90 }}>{insignia.nombre}</span>
            </div>
          ))}
          <div className="insignia-medalla">
            <span className="aro" style={{ borderColor: 'var(--borde)' }}>🌱</span>
            <strong>{resumenes.filter((r) => !r.resumen.insignia).length}</strong>
            <span className="pequeno suave" style={{ maxWidth: 90 }}>En camino</span>
          </div>
        </div>
      </div>

      <div className="seccion-titulo">
        <h2>⛺ Patrullas</h2>
      </div>
      <div className="grid-2">
        {patrullas.map((p) => {
          const miembros = scoutsDePatrulla(state, p.id);
          const conquistas = miembros.reduce((s, m) => s + resumenScout(state, m.id).conquistados, 0);
          return (
            <div key={p.id} className="tarjeta sin-margen" style={{ borderTop: `5px solid ${p.color || 'var(--verde-claro)'}` }}>
              <div className="fila-separada">
                <strong>
                  {p.emblema} {p.nombre}
                </strong>
                <span className="pequeno suave">{miembros.length} scouts</span>
              </div>
              <div className="mt">
                <BarraProgreso valor={conquistas} total={maxPatrulla} color={p.color} />
                <span className="pequeno suave">{conquistas} territorios conquistados</span>
              </div>
              <div className="fila mt" style={{ flexWrap: 'wrap', gap: 4 }}>
                {miembros.map((m) => (
                  <span key={m.id} title={m.nombre} style={{ cursor: 'pointer' }} onClick={() => navegar({ v: 'scout-detalle', scoutId: m.id })}>
                    <Avatar usuario={m} tam={30} />
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="seccion-titulo">
        <h2>🧑‍🤝‍🧑 Avance individual</h2>
        <span className="pequeno suave">{totalConquistas} conquistas en total</span>
      </div>
      <div className="tarjeta tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Scout</th>
              <th>Insignia</th>
              {RUTAS.map((r) => (
                <th key={r.id} title={r.nombre} className="centrado">{r.icono}</th>
              ))}
              <th>🚶</th>
              <th>⏳</th>
            </tr>
          </thead>
          <tbody>
            {resumenes
              .slice()
              .sort((a, b) => a.scout.nombre.localeCompare(b.scout.nombre))
              .map(({ scout, resumen }) => (
                <tr
                  key={scout.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navegar({ v: 'scout-detalle', scoutId: scout.id })}
                >
                  <td>
                    <span className="fila" style={{ gap: 6 }}>
                      <Avatar usuario={scout} tam={26} /> {scout.nombre}
                    </span>
                  </td>
                  <td>{resumen.insignia ? `${resumen.insignia.icono} ${resumen.insignia.nombre}` : '—'}</td>
                  {RUTAS.map((r) => (
                    <td key={r.id}>
                      <EscalonesRuta progreso={resumen.niveles[r.id]} rutaId={r.id} compacto />
                    </td>
                  ))}
                  <td>{resumen.enProgreso}</td>
                  <td>{resumen.enRevision}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {scouts.length === 0 && (
          <p className="suave centrado mt">
            Aún no hay scouts en la tropa. Agrégalos desde la pestaña Gestión.
          </p>
        )}
      </div>
    </div>
  );
}

function Indicador({ valor, texto, icono, alerta, onClick }) {
  return (
    <div
      className="centrado"
      style={{
        background: alerta ? '#fdf3e0' : 'var(--verde-suave)',
        borderRadius: 12,
        padding: '10px 6px',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
        {icono} {valor}
      </div>
      <div className="pequeno suave">{texto}</div>
    </div>
  );
}
