import React, { useState } from 'react';
import { useApp, uid } from '../../state/store.jsx';
import { useNav, useSesion } from '../../state/nav.jsx';
import { RUTAS, NIVELES, getRuta, nivelInfo } from '../../data/progresion.js';
import { progresoRutas } from '../../state/logica.js';
import { EscalonesRuta, Modal, NivelChip, EstadoChip, ParcheRuta } from '../../components/comunes.jsx';
import { estadoInfo } from '../../state/logica.js';

/**
 * Exploración de rutas y territorios.
 * - Sin rutaId: muestra las 6 rutas.
 * - Con rutaId: muestra los territorios de esa ruta con tarjetas de ejemplos
 *   y permite iniciar la conquista de un territorio.
 * Puede usarse para el propio scout (scoutId = usuario actual) o por un jefe
 * planeando con un scout (prop scoutId).
 */
export default function Explorar({ rutaId, scoutId: scoutIdProp, alCrear }) {
  const { state, dispatch } = useApp();
  const { navegar, vista } = useNav();
  const { usuario } = useSesion();
  const scoutId = scoutIdProp || usuario.id;
  const [modalTerritorio, setModalTerritorio] = useState(null); // territorio para iniciar conquista

  const progreso = progresoRutas(state, scoutId);

  if (!rutaId) {
    return (
      <div>
        <h2 style={{ color: 'var(--verde)' }}>🗺️ Explora las 6 Rutas</h2>
        <p className="suave">
          Cada ruta tiene territorios por conquistar. Elige una para ver sus territorios,
          ejemplos y comenzar una conquista.
        </p>
        <div className="grid-2">
          {RUTAS.map((r) => {
            const p = progreso[r.id];
            return (
              <div
                key={r.id}
                className="tarjeta tarjeta-clic sin-margen"
                onClick={() => navegar({ ...vista, rutaId: r.id })}
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
                <p className="pequeno mt sin-margen">{r.descripcion}</p>
                <div className="fila-separada mt">
                  <EscalonesRuta progreso={p} rutaId={r.id} />
                  <span className="pequeno suave">{r.territorios.length} territorios</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const ruta = getRuta(rutaId);
  if (!ruta) return null;
  const trabajosScout = state.trabajos.filter((t) => t.scoutId === scoutId);

  return (
    <div>
      <button className="btn-icono" onClick={() => navegar({ ...vista, rutaId: null })}>
        ← Todas las rutas
      </button>
      <div className="tarjeta" style={{ borderTop: `6px solid ${ruta.color}` }}>
        <div className="tarjeta-cabecera">
          <span className="icono-grande" style={{ background: ruta.colorSuave }}>
            {ruta.icono}
          </span>
          <div>
            <h2 className="sin-margen">{ruta.nombre}</h2>
            <p className="suave pequeno sin-margen">
              {ruta.lema} · {ruta.area}
            </p>
          </div>
        </div>
        <div className="fila mt">
          <EscalonesRuta progreso={progreso[ruta.id]} rutaId={ruta.id} />
          <span className="pequeno suave">
            Conquista 2 territorios del mismo nivel para que la ruta suba a ese nivel.
          </span>
        </div>
      </div>

      {ruta.territorios.map((territorio) => (
        <TarjetaTerritorio
          key={territorio.id}
          territorio={territorio}
          ruta={ruta}
          trabajos={trabajosScout.filter((t) => t.territorioId === territorio.id)}
          onConquistar={() => setModalTerritorio(territorio)}
          onAbrirTrabajo={(t) => navegar({ v: 'trabajo', trabajoId: t.id, desde: 'explorar', rutaId })}
        />
      ))}

      <ModalNuevaConquista
        territorio={modalTerritorio}
        ruta={ruta}
        scoutId={scoutId}
        trabajos={modalTerritorio ? trabajosScout.filter((t) => t.territorioId === modalTerritorio.id) : []}
        onCerrar={() => setModalTerritorio(null)}
        onCrear={(nivel) => {
          const id = uid('tr');
          dispatch({ type: 'trabajo/crear', id, scoutId, territorioId: modalTerritorio.id, nivel });
          setModalTerritorio(null);
          if (alCrear) alCrear(id);
          else navegar({ v: 'trabajo', trabajoId: id, desde: 'explorar', rutaId });
        }}
      />
    </div>
  );
}

function TarjetaTerritorio({ territorio, ruta, trabajos, onConquistar, onAbrirTrabajo }) {
  const [nivelAbierto, setNivelAbierto] = useState('descubro');
  const nInfo = nivelInfo(nivelAbierto);

  return (
    <div className="tarjeta">
      <div className="tarjeta-cabecera">
        <span className="icono-grande" style={{ background: ruta.colorSuave, fontSize: '1.5rem' }}>
          {territorio.icono}
        </span>
        <div style={{ flex: 1 }}>
          <h3 className="sin-margen">{territorio.nombre}</h3>
          <p className="suave pequeno sin-margen">{territorio.subtitulo}</p>
        </div>
      </div>

      <p className="pequeno mt" style={{ background: '#f6f3ea', borderRadius: 10, padding: '8px 12px' }}>
        <strong>La competencia:</strong> {territorio.competencia}
      </p>

      {/* Tarjetas de ejemplos por nivel */}
      <div className="fila" style={{ gap: 6, flexWrap: 'wrap' }}>
        {NIVELES.map((n) => (
          <button
            key={n.id}
            className="chip"
            style={
              nivelAbierto === n.id
                ? { background: n.color, color: '#fff', borderColor: n.color, cursor: 'pointer' }
                : { background: '#fff', color: n.colorTexto, borderColor: n.color, cursor: 'pointer', opacity: 0.75 }
            }
            onClick={() => setNivelAbierto(n.id)}
          >
            {n.icono} {n.nombre}
          </button>
        ))}
      </div>
      <div className="pequeno" style={{ background: nInfo.colorSuave, borderRadius: 10, padding: '10px 14px', marginTop: 8 }}>
        <strong style={{ color: nInfo.colorTexto }}>
          Ideas para conquistarlo en {nInfo.nombre}:
        </strong>
        <ul className="detalle-lista" style={{ marginTop: 6 }}>
          {territorio.ejemplos[nivelAbierto].map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>

      {/* Trabajos existentes sobre este territorio */}
      {trabajos.length > 0 && (
        <div className="mt">
          {trabajos.map((t) => (
            <button
              key={t.id}
              className="chip"
              style={{
                borderColor: estadoInfo(t.estado).color,
                color: estadoInfo(t.estado).color,
                background: '#fff',
                cursor: 'pointer',
                marginRight: 6,
                marginBottom: 4,
              }}
              onClick={() => onAbrirTrabajo(t)}
            >
              {estadoInfo(t.estado).icono} {nivelInfo(t.nivel).nombre}: {estadoInfo(t.estado).nombre} →
            </button>
          ))}
        </div>
      )}

      <div className="fila-botones">
        <button className="btn" onClick={onConquistar}>
          🚩 Conquistar este territorio
        </button>
      </div>
    </div>
  );
}

function ModalNuevaConquista({ territorio, ruta, trabajos, onCerrar, onCrear }) {
  // Sugerir el siguiente nivel no conquistado
  const conquistadosNiveles = new Set(
    trabajos.filter((t) => t.estado === 'conquistado').map((t) => t.nivel)
  );
  const enCursoNiveles = new Set(
    trabajos.filter((t) => t.estado !== 'conquistado').map((t) => t.nivel)
  );
  const sugerido =
    ['descubro', 'construyo', 'conquisto'].find(
      (n) => !conquistadosNiveles.has(n) && !enCursoNiveles.has(n)
    ) || 'descubro';
  const [nivel, setNivel] = useState(sugerido);

  // Reiniciar la selección cuando cambia el territorio
  const [territorioAnterior, setTerritorioAnterior] = useState(territorio);
  if (territorio !== territorioAnterior) {
    setTerritorioAnterior(territorio);
    setNivel(sugerido);
  }

  if (!territorio) return null;

  const bloqueado = enCursoNiveles.has(nivel) || conquistadosNiveles.has(nivel);

  return (
    <Modal abierto={Boolean(territorio)} onCerrar={onCerrar} titulo={`Conquistar: ${territorio.nombre}`}>
      <p className="pequeno suave">
        {ruta.icono} {ruta.nombre} · Elige el nivel en el que vas a trabajar este territorio.
      </p>
      {NIVELES.map((n) => {
        const yaConquistado = conquistadosNiveles.has(n.id);
        const yaEnCurso = enCursoNiveles.has(n.id);
        return (
          <div
            key={n.id}
            onClick={() => setNivel(n.id)}
            className="tarjeta"
            style={{
              cursor: 'pointer',
              padding: '10px 14px',
              marginBottom: 8,
              border: nivel === n.id ? `2.5px solid ${n.color}` : '1px solid var(--borde)',
              background: nivel === n.id ? n.colorSuave : '#fff',
              opacity: yaConquistado || yaEnCurso ? 0.55 : 1,
            }}
          >
            <div className="fila">
              <ParcheRuta rutaId={ruta.id} nivel={n.id} tam={44} />
              <div style={{ flex: 1 }}>
                <div className="fila-separada">
                  <strong>
                    {n.nombre} <span className="pequeno suave">({n.tono})</span>
                  </strong>
                  {yaConquistado && <span className="chip" style={{ borderColor: n.color, color: n.colorTexto }}>✅ Conquistado</span>}
                  {yaEnCurso && <span className="chip" style={{ borderColor: n.color, color: n.colorTexto }}>🚶 En curso</span>}
                </div>
                <div className="pequeno suave">{n.descripcion}</div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="fila-botones">
        <button className="btn" disabled={bloqueado} onClick={() => onCrear(nivel)}>
          🚩 Comenzar conquista en {nivelInfo(nivel).nombre}
        </button>
      </div>
      {bloqueado && (
        <p className="pequeno suave mt">
          Ya {conquistadosNiveles.has(nivel) ? 'conquistaste' : 'estás trabajando'} este territorio en ese
          nivel. Elige otro nivel.
        </p>
      )}
    </Modal>
  );
}
