import React from 'react';
import { useApp } from '../../state/store.jsx';
import { useNav, useSesion } from '../../state/nav.jsx';
import { RUTAS, getTerritorio, getRutaDeTerritorio } from '../../data/progresion.js';
import {
  insigniaDeScout,
  trabajosDeScout,
  ultimaRevision,
  patrulla,
  fechaCorta,
} from '../../state/logica.js';
import { Avatar, EscalonesRuta, EstadoChip, NivelChip } from '../../components/comunes.jsx';

export function InsigniaMedalla({ insignia, etiqueta }) {
  if (!insignia) {
    return (
      <div className="insignia-medalla">
        <span className="aro" style={{ borderColor: 'var(--borde)', filter: 'grayscale(1)', opacity: 0.6 }}>
          🎖️
        </span>
        <span className="pequeno suave">{etiqueta || 'Aún sin insignia'}</span>
      </div>
    );
  }
  return (
    <div className="insignia-medalla">
      {insignia.imagen ? (
        <img className="fase-imagen" src={insignia.imagen} alt={insignia.nombre} draggable={false} />
      ) : (
        <span className="aro" style={{ borderColor: insignia.color }}>
          {insignia.icono}
        </span>
      )}
      <span className="pequeno" style={{ fontWeight: 700, color: insignia.color }}>
        {insignia.nombre}
      </span>
      {etiqueta && <span className="pequeno suave">{etiqueta}</span>}
    </div>
  );
}

export default function InicioScout() {
  const { state } = useApp();
  const { navegar } = useNav();
  const { usuario } = useSesion();

  const { actual, siguiente, faltante } = insigniaDeScout(state, usuario.id);
  const progreso = insigniaDeScout(state, usuario.id).niveles;
  const trabajos = trabajosDeScout(state, usuario.id);
  const enCurso = trabajos.filter((t) => t.estado !== 'conquistado');
  const conquistados = trabajos.filter((t) => t.estado === 'conquistado');
  const miPatrulla = usuario.patrullaId ? patrulla(state, usuario.patrullaId) : null;

  return (
    <div>
      {/* Encabezado personal */}
      <div className="tarjeta">
        <div className="fila-separada">
          <div className="fila">
            <Avatar usuario={usuario} tam={54} />
            <div>
              <h2 className="sin-margen">¡Hola, {usuario.nombre.split(' ')[0]}!</h2>
              <p className="suave pequeno sin-margen">
                {miPatrulla ? `${miPatrulla.emblema} Patrulla ${miPatrulla.nombre}` : 'Sin patrulla asignada'}
              </p>
            </div>
          </div>
          <InsigniaMedalla insignia={actual} />
        </div>
        {siguiente && (
          <div className="nota mt">
            <strong>Próxima insignia: {siguiente.icono} {siguiente.nombre}</strong>
            <div className="pequeno suave">{siguiente.requisitoTexto}</div>
            {faltante.length > 0 && (
              <div className="pequeno mt">
                Te falta: {faltante.join(' · ')}
              </div>
            )}
          </div>
        )}
        {!siguiente && actual?.esMaxima && (
          <div className="nota nota-aprobado mt">
            🏅 ¡Has alcanzado la máxima insignia de la Rama Scout! Eres Maestro de la Aventura.
          </div>
        )}
      </div>

      {/* Conquistas en curso */}
      <div className="seccion-titulo">
        <h2>🚩 Mis conquistas en curso</h2>
        <button className="btn btn-secundario" onClick={() => navegar({ v: 'explorar' })}>
          ➕ Nueva
        </button>
      </div>
      {enCurso.length === 0 && (
        <div className="tarjeta centrado suave">
          No tienes territorios en conquista. ¡Explora las rutas y elige tu próximo desafío!
        </div>
      )}
      {enCurso.map((t) => {
        const territorio = getTerritorio(t.territorioId);
        const ruta = getRutaDeTerritorio(t.territorioId);
        const rev = ultimaRevision(t);
        const necesitaAjustes = rev?.decision === 'ajustes' && t.estado === 'en_progreso';
        return (
          <div
            key={t.id}
            className="tarjeta tarjeta-clic"
            onClick={() => navegar({ v: 'trabajo', trabajoId: t.id, desde: 'inicio' })}
          >
            <div className="fila-separada">
              <div className="fila">
                <span className="icono-grande" style={{ background: ruta.colorSuave, fontSize: '1.4rem', width: 42, height: 42 }}>
                  {territorio.icono}
                </span>
                <div>
                  <strong>{territorio.nombre}</strong>
                  <div className="pequeno suave">{ruta.nombre}</div>
                </div>
              </div>
              <div className="fila" style={{ gap: 6 }}>
                <NivelChip nivel={t.nivel} />
                <EstadoChip estado={t.estado} />
              </div>
            </div>
            {necesitaAjustes && (
              <div className="nota nota-ajustes pequeno" style={{ marginTop: 10, marginBottom: 0 }}>
                ✏️ Tu dirigente te pidió ajustes el {fechaCorta(rev.fecha)}. Toca para verlos.
              </div>
            )}
          </div>
        );
      })}

      {/* Mapa de rutas */}
      <div className="seccion-titulo">
        <h2>🗺️ Mi mapa de rutas</h2>
      </div>
      <div className="grid-2">
        {RUTAS.map((r) => {
          const p = progreso[r.id];
          return (
            <div
              key={r.id}
              className="tarjeta tarjeta-clic sin-margen"
              onClick={() => navegar({ v: 'explorar', rutaId: r.id })}
            >
              <div className="tarjeta-cabecera">
                <span className="icono-grande" style={{ background: r.colorSuave }}>
                  {r.icono}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{r.nombre}</strong>
                  <div className="pequeno suave">{r.lema}</div>
                </div>
              </div>
              <div className="fila-separada mt">
                <EscalonesRuta progreso={p} rutaId={r.id} />
                <span className="pequeno suave">
                  {p.totalConquistados} conquistado{p.totalConquistados === 1 ? '' : 's'}
                  {p.enCurso > 0 ? ` · ${p.enCurso} en curso` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Territorios conquistados */}
      {conquistados.length > 0 && (
        <>
          <div className="seccion-titulo">
            <h2>🏆 Territorios conquistados ({conquistados.length})</h2>
          </div>
          {conquistados
            .slice()
            .sort((a, b) => (b.conquistadoEn || '').localeCompare(a.conquistadoEn || ''))
            .map((t) => {
              const territorio = getTerritorio(t.territorioId);
              const ruta = getRutaDeTerritorio(t.territorioId);
              return (
                <div
                  key={t.id}
                  className="tarjeta tarjeta-clic"
                  onClick={() => navegar({ v: 'trabajo', trabajoId: t.id, desde: 'inicio' })}
                >
                  <div className="fila-separada">
                    <div className="fila">
                      <span style={{ fontSize: '1.3rem' }}>{territorio.icono}</span>
                      <div>
                        <strong>{territorio.nombre}</strong>
                        <span className="pequeno suave"> · {ruta.nombre}</span>
                        <div className="pequeno suave">Conquistado el {fechaCorta(t.conquistadoEn)}</div>
                      </div>
                    </div>
                    <NivelChip nivel={t.nivel} />
                  </div>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}
