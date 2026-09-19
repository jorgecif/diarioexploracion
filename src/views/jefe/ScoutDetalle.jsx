import React, { useState } from 'react';
import { useApp, uid } from '../../state/store.jsx';
import { useNav } from '../../state/nav.jsx';
import { RUTAS, NIVELES, getTerritorio, getRutaDeTerritorio, nivelInfo } from '../../data/progresion.js';
import {
  usuario as buscarUsuario,
  patrulla as buscarPatrulla,
  insigniaDeScout,
  trabajosDeScout,
  fechaCorta,
} from '../../state/logica.js';
import { Avatar, EscalonesRuta, EstadoChip, Modal, NivelChip } from '../../components/comunes.jsx';
import { InsigniaMedalla } from '../scout/InicioScout.jsx';

/** Vista del dirigente sobre un scout: progresión completa y planeación conjunta. */
export default function ScoutDetalle({ scoutId }) {
  const { state, dispatch } = useApp();
  const { navegar } = useNav();
  const [planeando, setPlaneando] = useState(false);

  const scout = buscarUsuario(state, scoutId);
  if (!scout) {
    return (
      <div className="tarjeta centrado">
        <p>Este scout ya no existe.</p>
        <button className="btn" onClick={() => navegar({ v: 'inicio' })}>← Volver</button>
      </div>
    );
  }

  const { actual, siguiente, faltante, niveles } = insigniaDeScout(state, scoutId);
  const trabajos = trabajosDeScout(state, scoutId);
  const enCurso = trabajos.filter((t) => t.estado !== 'conquistado');
  const conquistados = trabajos.filter((t) => t.estado === 'conquistado');
  const miPatrulla = scout.patrullaId ? buscarPatrulla(state, scout.patrullaId) : null;

  return (
    <div>
      <button className="btn-icono" onClick={() => navegar({ v: 'inicio' })}>← Tropa</button>

      <div className="tarjeta">
        <div className="fila-separada">
          <div className="fila">
            <Avatar usuario={scout} tam={54} />
            <div>
              <h2 className="sin-margen">{scout.nombre}</h2>
              <p className="suave pequeno sin-margen">
                {miPatrulla ? `${miPatrulla.emblema} Patrulla ${miPatrulla.nombre}` : 'Sin patrulla'}
              </p>
            </div>
          </div>
          <InsigniaMedalla insignia={actual} />
        </div>
        {siguiente && (
          <div className="nota mt">
            <strong>Próxima insignia: {siguiente.icono} {siguiente.nombre}</strong>
            {faltante.length > 0 && <div className="pequeno mt">Le falta: {faltante.join(' · ')}</div>}
          </div>
        )}
      </div>

      <div className="seccion-titulo">
        <h2>🗺️ Sus rutas</h2>
        <button className="btn" onClick={() => setPlaneando(true)}>
          ➕ Planear territorio juntos
        </button>
      </div>
      <div className="grid-2">
        {RUTAS.map((r) => {
          const p = niveles[r.id];
          return (
            <div key={r.id} className="tarjeta sin-margen">
              <div className="fila-separada">
                <strong>
                  {r.icono} {r.nombre}
                </strong>
                <EscalonesRuta progreso={p} rutaId={r.id} />
              </div>
              <div className="pequeno suave mt">
                {p.totalConquistados} conquistados · {p.enCurso} en curso
              </div>
            </div>
          );
        })}
      </div>

      <div className="seccion-titulo">
        <h2>🚩 Conquistas en curso ({enCurso.length})</h2>
      </div>
      {enCurso.length === 0 && (
        <div className="tarjeta suave centrado">
          No tiene territorios en curso. Usa «Planear territorio juntos» para acordar el próximo desafío.
        </div>
      )}
      {enCurso.map((t) => {
        const territorio = getTerritorio(t.territorioId);
        const ruta = getRutaDeTerritorio(t.territorioId);
        return (
          <div
            key={t.id}
            className="tarjeta tarjeta-clic"
            onClick={() => navegar({ v: 'trabajo', trabajoId: t.id, desde: 'scout-detalle', scoutId })}
          >
            <div className="fila-separada">
              <div>
                <strong>
                  {territorio.icono} {territorio.nombre}
                </strong>
                <div className="pequeno suave">{ruta.nombre}</div>
              </div>
              <div className="fila" style={{ gap: 6 }}>
                <NivelChip nivel={t.nivel} />
                <EstadoChip estado={t.estado} />
              </div>
            </div>
            {!t.plan?.acordado && t.plan?.texto && (
              <div className="nota nota-ajustes pequeno" style={{ margin: '10px 0 0' }}>
                🤝 Tiene un plan escrito pendiente de acordar contigo.
              </div>
            )}
          </div>
        );
      })}

      {conquistados.length > 0 && (
        <>
          <div className="seccion-titulo">
            <h2>🏆 Conquistados ({conquistados.length})</h2>
          </div>
          {conquistados.map((t) => {
            const territorio = getTerritorio(t.territorioId);
            return (
              <div
                key={t.id}
                className="tarjeta tarjeta-clic"
                onClick={() => navegar({ v: 'trabajo', trabajoId: t.id, desde: 'scout-detalle', scoutId })}
              >
                <div className="fila-separada">
                  <span>
                    {territorio.icono} {territorio.nombre}
                    <span className="pequeno suave"> · {fechaCorta(t.conquistadoEn)}</span>
                  </span>
                  <NivelChip nivel={t.nivel} />
                </div>
              </div>
            );
          })}
        </>
      )}

      <ModalPlanearJuntos
        abierto={planeando}
        onCerrar={() => setPlaneando(false)}
        trabajos={trabajos}
        onCrear={(territorioId, nivel) => {
          const id = uid('tr');
          dispatch({ type: 'trabajo/crear', id, scoutId, territorioId, nivel });
          setPlaneando(false);
          navegar({ v: 'trabajo', trabajoId: id, desde: 'scout-detalle', scoutId });
        }}
      />
    </div>
  );
}

function ModalPlanearJuntos({ abierto, onCerrar, trabajos, onCrear }) {
  const [rutaId, setRutaId] = useState(RUTAS[0].id);
  const [territorioId, setTerritorioId] = useState(RUTAS[0].territorios[0].id);
  const [nivel, setNivel] = useState('descubro');

  const ruta = RUTAS.find((r) => r.id === rutaId);
  const territorio = getTerritorio(territorioId);
  const ocupado = trabajos.some(
    (t) => t.territorioId === territorioId && t.nivel === nivel
  );

  function cambiarRuta(id) {
    setRutaId(id);
    const r = RUTAS.find((x) => x.id === id);
    setTerritorioId(r.territorios[0].id);
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Planear un territorio juntos">
      <p className="pequeno suave">
        Acuerda con el scout qué territorio va a conquistar y en qué nivel. Después podrán
        escribir el plan en la conquista.
      </p>
      <label>Ruta</label>
      <select value={rutaId} onChange={(e) => cambiarRuta(e.target.value)}>
        {RUTAS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.icono} {r.nombre}
          </option>
        ))}
      </select>
      <label>Territorio</label>
      <select value={territorioId} onChange={(e) => setTerritorioId(e.target.value)}>
        {ruta.territorios.map((t) => (
          <option key={t.id} value={t.id}>
            {t.icono} {t.nombre}
          </option>
        ))}
      </select>
      {territorio && <p className="pequeno suave mt">{territorio.competencia}</p>}
      <label>Nivel</label>
      <div className="fila" style={{ gap: 6, flexWrap: 'wrap' }}>
        {NIVELES.map((n) => (
          <button
            key={n.id}
            className="chip"
            style={
              nivel === n.id
                ? { background: n.color, color: '#fff', borderColor: n.color, cursor: 'pointer' }
                : { background: '#fff', color: n.colorTexto, borderColor: n.color, cursor: 'pointer' }
            }
            onClick={() => setNivel(n.id)}
          >
            {n.icono} {n.nombre}
          </button>
        ))}
      </div>
      {territorio && (
        <div className="pequeno mt" style={{ background: nivelInfo(nivel).colorSuave, borderRadius: 10, padding: '8px 12px' }}>
          <strong>Ideas en {nivelInfo(nivel).nombre}:</strong>
          <ul className="detalle-lista">
            {territorio.ejemplos[nivel].map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {ocupado && (
        <p className="pequeno mt" style={{ color: 'var(--rojo)' }}>
          Este scout ya tiene este territorio en ese nivel (en curso o conquistado).
        </p>
      )}
      <div className="fila-botones">
        <button className="btn" disabled={ocupado} onClick={() => onCrear(territorioId, nivel)}>
          🚩 Crear conquista
        </button>
      </div>
    </Modal>
  );
}
