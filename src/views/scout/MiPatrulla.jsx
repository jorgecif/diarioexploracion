import React from 'react';
import { useApp } from '../../state/store.jsx';
import { useSesion } from '../../state/nav.jsx';
import { RUTAS } from '../../data/progresion.js';
import {
  patrulla as buscarPatrulla,
  patrullasDeTropa,
  scoutsDePatrulla,
  resumenScout,
} from '../../state/logica.js';
import { Avatar, BarraProgreso, EscalonesRuta, Vacio } from '../../components/comunes.jsx';
import { InsigniaMedalla } from './InicioScout.jsx';

export default function MiPatrulla() {
  const { state } = useApp();
  const { usuario } = useSesion();

  const miPatrulla = usuario.patrullaId ? buscarPatrulla(state, usuario.patrullaId) : null;

  if (!miPatrulla) {
    return (
      <Vacio icono="⛺" titulo="Aún no tienes patrulla" texto="Pídele a tu dirigente que te asigne a una patrulla para ver el avance de tus compañeros." />
    );
  }

  const miembros = scoutsDePatrulla(state, miPatrulla.id);
  const resumenes = miembros.map((m) => ({ scout: m, resumen: resumenScout(state, m.id) }));
  const totalConquistas = resumenes.reduce((s, r) => s + r.resumen.conquistados, 0);

  // Comparación entre patrullas de la tropa
  const patrullas = patrullasDeTropa(state, usuario.tropaId).map((p) => {
    const scouts = scoutsDePatrulla(state, p.id);
    const conquistas = scouts.reduce((s, m) => s + resumenScout(state, m.id).conquistados, 0);
    return { patrulla: p, scouts: scouts.length, conquistas };
  });
  const maxConquistas = Math.max(1, ...patrullas.map((p) => p.conquistas));

  return (
    <div>
      <div className="tarjeta" style={{ borderTop: `6px solid ${miPatrulla.color || 'var(--verde-claro)'}` }}>
        <div className="tarjeta-cabecera">
          <span className="icono-grande" style={{ background: 'var(--verde-suave)' }}>
            {miPatrulla.emblema}
          </span>
          <div>
            <h2 className="sin-margen">Patrulla {miPatrulla.nombre}</h2>
            <p className="suave pequeno sin-margen">
              {miembros.length} scouts · {totalConquistas} territorios conquistados
            </p>
          </div>
        </div>
      </div>

      <div className="seccion-titulo">
        <h2>🧑‍🤝‍🧑 Mis compañeros</h2>
      </div>
      {resumenes.map(({ scout, resumen }) => (
        <div key={scout.id} className="tarjeta">
          <div className="fila-separada">
            <div className="fila">
              <Avatar usuario={scout} tam={44} />
              <div>
                <strong>
                  {scout.nombre}
                  {scout.id === usuario.id ? ' (tú)' : ''}
                </strong>
                <div className="pequeno suave">
                  🏆 {resumen.conquistados} conquistados · 🚶 {resumen.enProgreso} en curso
                  {resumen.enRevision > 0 ? ` · ⏳ ${resumen.enRevision} en revisión` : ''}
                </div>
              </div>
            </div>
            <InsigniaMedalla insignia={resumen.insignia} />
          </div>
          <div className="mt" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {RUTAS.map((r) => (
              <div key={r.id} className="fila" style={{ gap: 6 }}>
                <span title={r.nombre}>{r.icono}</span>
                <EscalonesRuta progreso={resumen.niveles[r.id]} rutaId={r.id} compacto />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="seccion-titulo">
        <h2>🏕️ Las patrullas de la tropa</h2>
      </div>
      <div className="tarjeta">
        {patrullas.map(({ patrulla: p, scouts, conquistas }) => (
          <div key={p.id} style={{ marginBottom: 12 }}>
            <div className="fila-separada">
              <strong>
                {p.emblema} {p.nombre} {p.id === miPatrulla.id ? '⭐' : ''}
              </strong>
              <span className="pequeno suave">
                {conquistas} conquistas · {scouts} scouts
              </span>
            </div>
            <BarraProgreso valor={conquistas} total={maxConquistas} color={p.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
