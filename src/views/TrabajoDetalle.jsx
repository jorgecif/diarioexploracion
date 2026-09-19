import React, { useState } from 'react';
import { useApp } from '../state/store.jsx';
import { useNav, useSesion } from '../state/nav.jsx';
import { getTerritorio, getRutaDeTerritorio, nivelInfo, ROLES_DIRIGENTE } from '../data/progresion.js';
import { usuario as buscarUsuario, fechaCorta, fechaHora, ultimaRevision } from '../state/logica.js';
import { AreaTextoVoz, EstadoChip, Modal, NivelChip, ParcheRuta } from '../components/comunes.jsx';

/**
 * Detalle de una conquista (trabajo sobre un territorio).
 * La usan el scout dueño (planear, registrar avances, enviar a revisión)
 * y los dirigentes de la tropa (acordar plan, revisar, dar realimentación).
 */
export default function TrabajoDetalle({ trabajoId, alVolver }) {
  const { state, dispatch } = useApp();
  const { usuario: actual } = useSesion();

  const trabajo = state.trabajos.find((t) => t.id === trabajoId);
  const [planBorrador, setPlanBorrador] = useState(trabajo?.plan?.texto || '');
  const [nuevoAvance, setNuevoAvance] = useState('');
  const [comentarioRevision, setComentarioRevision] = useState('');
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  if (!trabajo) {
    return (
      <div className="tarjeta centrado">
        <p>Esta conquista ya no existe.</p>
        <button className="btn" onClick={alVolver}>← Volver</button>
      </div>
    );
  }

  const territorio = getTerritorio(trabajo.territorioId);
  const ruta = getRutaDeTerritorio(trabajo.territorioId);
  const nivel = nivelInfo(trabajo.nivel);
  const scout = buscarUsuario(state, trabajo.scoutId);
  const esDueno = actual.id === trabajo.scoutId;
  const esJefe = actual.rol === 'jefe' && actual.tropaId === scout?.tropaId;
  const puedeEditar = (esDueno || esJefe) && trabajo.estado !== 'conquistado';
  const rev = ultimaRevision(trabajo);
  const rolDirigente = ROLES_DIRIGENTE.find((r) => r.nivel === trabajo.nivel);

  const planCambiado = planBorrador !== (trabajo.plan?.texto || '');

  function guardarPlan() {
    dispatch({ type: 'trabajo/plan', trabajoId: trabajo.id, texto: planBorrador });
  }

  function agregarAvance() {
    if (!nuevoAvance.trim()) return;
    dispatch({ type: 'trabajo/avance', trabajoId: trabajo.id, autorId: actual.id, texto: nuevoAvance.trim() });
    setNuevoAvance('');
  }

  function enviarRevision() {
    if (planCambiado) guardarPlan();
    dispatch({ type: 'trabajo/enviar-revision', trabajoId: trabajo.id });
  }

  function revisar(decision) {
    if (decision === 'ajustes' && !comentarioRevision.trim()) return;
    dispatch({
      type: 'trabajo/revisar',
      trabajoId: trabajo.id,
      autorId: actual.id,
      decision,
      comentario: comentarioRevision.trim() || (decision === 'aprobado' ? '¡Territorio conquistado! Felicitaciones.' : ''),
    });
    setComentarioRevision('');
  }

  return (
    <div>
      <button className="btn-icono" onClick={alVolver}>← Volver</button>

      {/* Encabezado */}
      <div className="tarjeta" style={{ borderTop: `6px solid ${ruta.color}` }}>
        <div className="tarjeta-cabecera">
          <span className="icono-grande" style={{ background: ruta.colorSuave, fontSize: '1.6rem' }}>
            {territorio.icono}
          </span>
          <div style={{ flex: 1 }}>
            <h2 className="sin-margen">{territorio.nombre}</h2>
            <p className="suave pequeno sin-margen">
              {ruta.icono} {ruta.nombre}
              {!esDueno && scout ? ` · Scout: ${scout.nombre}` : ''}
            </p>
          </div>
          <ParcheRuta
            rutaId={ruta.id}
            nivel={trabajo.nivel}
            tam={56}
            estado={trabajo.estado === 'conquistado' ? 'logrado' : 'parcial'}
            titulo={`Insignia ${ruta.nombre} · ${nivel.nombre}${trabajo.estado === 'conquistado' ? '' : ' (en conquista)'}`}
          />
        </div>
        <div className="fila mt" style={{ flexWrap: 'wrap', gap: 6 }}>
          <NivelChip nivel={trabajo.nivel} />
          <EstadoChip estado={trabajo.estado} />
          {trabajo.plan?.acordado && (
            <span className="chip" style={{ borderColor: 'var(--verde-claro)', color: 'var(--verde)' }}>
              🤝 Plan acordado
            </span>
          )}
        </div>
        <p className="pequeno suave mt sin-margen">
          <strong>La competencia:</strong> {territorio.competencia}
        </p>
      </div>

      {/* Realimentación más reciente */}
      {rev && trabajo.estado !== 'en_revision' && (
        <div className={`nota ${rev.decision === 'aprobado' ? 'nota-aprobado' : 'nota-ajustes'}`}>
          <strong>
            {rev.decision === 'aprobado' ? '✅ Aprobado' : '✏️ Ajustes solicitados'} por{' '}
            {buscarUsuario(state, rev.autorId)?.nombre || 'tu dirigente'} · {fechaCorta(rev.fecha)}
          </strong>
          <p className="sin-margen mt">{rev.comentario}</p>
        </div>
      )}

      {/* Plan de conquista */}
      <div className="seccion-titulo">
        <h2>📝 Plan de conquista</h2>
      </div>
      <div className="tarjeta">
        <p className="pequeno suave">
          Escribe (o dicta 🎙️) cómo vas a conquistar este territorio, tal como lo conversaste con
          tu dirigente: qué harás, con quién y cuándo.
        </p>
        {puedeEditar ? (
          <>
            <AreaTextoVoz
              valor={planBorrador}
              onCambio={setPlanBorrador}
              filas={4}
              placeholder={`Ej: ${territorio.ejemplos[trabajo.nivel][0]}`}
            />
            {planCambiado && (
              <div className="fila-botones">
                <button className="btn" onClick={guardarPlan}>💾 Guardar plan</button>
              </div>
            )}
          </>
        ) : (
          <p style={{ whiteSpace: 'pre-wrap' }}>{trabajo.plan?.texto || 'Sin plan registrado.'}</p>
        )}

        {trabajo.plan?.acordado ? (
          <p className="pequeno suave mt sin-margen">
            🤝 Acordado con {buscarUsuario(state, trabajo.plan.acordado.por)?.nombre || 'el dirigente'} el{' '}
            {fechaCorta(trabajo.plan.acordado.fecha)}
            {esJefe && trabajo.estado !== 'conquistado' && (
              <>
                {' · '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch({ type: 'trabajo/plan-acordado', trabajoId: trabajo.id, quitar: true });
                  }}
                >
                  quitar acuerdo
                </a>
              </>
            )}
          </p>
        ) : (
          esJefe &&
          trabajo.estado !== 'conquistado' && (
            <div className="fila-botones">
              <button
                className="btn btn-secundario"
                disabled={!(planCambiado ? planBorrador : trabajo.plan?.texto)}
                onClick={() => {
                  if (planCambiado) guardarPlan();
                  dispatch({ type: 'trabajo/plan-acordado', trabajoId: trabajo.id, usuarioId: actual.id });
                }}
              >
                🤝 Marcar plan como acordado
              </button>
            </div>
          )
        )}
        {!trabajo.plan?.acordado && esDueno && (
          <p className="pequeno suave mt sin-margen">
            💡 Conversa tu plan con tu dirigente: él lo marcará como acordado cuando lo revisen juntos.
          </p>
        )}
      </div>

      {/* Rol del dirigente en este nivel (visible para el jefe) */}
      {esJefe && rolDirigente && (
        <div className="nota">
          {rolDirigente.icono} <strong>Tu rol en nivel {nivel.nombre}: {rolDirigente.rol}.</strong>{' '}
          <span className="pequeno">{rolDirigente.estilo} {rolDirigente.acciones}</span>
        </div>
      )}

      {/* Avances */}
      <div className="seccion-titulo">
        <h2>👣 Avances del diario ({trabajo.avances.length})</h2>
      </div>
      <div className="tarjeta">
        {trabajo.avances.length === 0 && (
          <p className="suave pequeno">Aún no hay avances registrados.</p>
        )}
        {trabajo.avances.length > 0 && (
          <div className="linea-tiempo">
            {trabajo.avances.map((a) => {
              const autor = buscarUsuario(state, a.autorId);
              return (
                <div key={a.id} className="evento">
                  <div className="evento-fecha">
                    {fechaHora(a.fecha)}
                    {autor && autor.id !== trabajo.scoutId ? ` · ${autor.nombre}` : ''}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{a.texto}</div>
                  {puedeEditar && esDueno && a.autorId === actual.id && (
                    <button
                      className="btn-icono pequeno"
                      title="Eliminar avance"
                      onClick={() => dispatch({ type: 'trabajo/avance-eliminar', trabajoId: trabajo.id, avanceId: a.id })}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {puedeEditar && (
          <>
            <label>Registrar un avance</label>
            <AreaTextoVoz
              valor={nuevoAvance}
              onCambio={setNuevoAvance}
              filas={3}
              placeholder="¿Qué hiciste? ¿Qué aprendiste? ¿Qué sigue?"
            />
            <div className="fila-botones">
              <button className="btn" disabled={!nuevoAvance.trim()} onClick={agregarAvance}>
                ➕ Registrar avance
              </button>
            </div>
          </>
        )}
      </div>

      {/* Acciones del scout */}
      {esDueno && trabajo.estado !== 'conquistado' && trabajo.estado !== 'en_revision' && (
        <div className="tarjeta">
          <h3>🚀 ¿Listo para la revisión?</h3>
          <p className="pequeno suave">
            Cuando sientas que conquistaste este territorio, envíalo a tu dirigente. Necesitas un
            plan escrito y al menos un avance registrado.
          </p>
          <div className="fila-botones">
            <button
              className="btn"
              disabled={!(planCambiado ? planBorrador.trim() : trabajo.plan?.texto) || trabajo.avances.length === 0}
              onClick={enviarRevision}
            >
              📨 Enviar a revisión
            </button>
            <button className="btn btn-peligro" onClick={() => setConfirmarEliminar(true)}>
              🗑️ Abandonar conquista
            </button>
          </div>
        </div>
      )}

      {esDueno && trabajo.estado === 'en_revision' && (
        <div className="tarjeta">
          <p className="sin-margen">
            ⏳ Enviado a revisión {trabajo.enviadoEn ? `el ${fechaCorta(trabajo.enviadoEn)}` : ''}. Tu
            dirigente lo revisará pronto.
          </p>
          <div className="fila-botones">
            <button
              className="btn btn-secundario"
              onClick={() => dispatch({ type: 'trabajo/retirar-revision', trabajoId: trabajo.id })}
            >
              ↩️ Retirar y seguir trabajando
            </button>
          </div>
        </div>
      )}

      {/* Panel de revisión del dirigente */}
      {esJefe && trabajo.estado !== 'conquistado' && (
        <div className="tarjeta" style={{ borderTop: '5px solid var(--naranja)' }}>
          <h3>🧑‍🏫 Realimentación del dirigente</h3>
          {trabajo.estado === 'en_revision' ? (
            <p className="pequeno suave">
              {scout?.nombre} envió esta conquista a revisión
              {trabajo.enviadoEn ? ` el ${fechaCorta(trabajo.enviadoEn)}` : ''}. Revisa el plan y los
              avances, y decide.
            </p>
          ) : (
            <p className="pequeno suave">
              Puedes dar realimentación en cualquier momento, o aprobar la conquista directamente.
            </p>
          )}
          <AreaTextoVoz
            valor={comentarioRevision}
            onCambio={setComentarioRevision}
            filas={3}
            placeholder="Escribe o dicta tu realimentación para el scout…"
          />
          <div className="fila-botones">
            <button className="btn" onClick={() => revisar('aprobado')}>
              ✅ Aprobar conquista
            </button>
            <button
              className="btn btn-secundario"
              disabled={!comentarioRevision.trim()}
              onClick={() => revisar('ajustes')}
            >
              ✏️ Pedir ajustes
            </button>
          </div>
          {!comentarioRevision.trim() && (
            <p className="pequeno suave mt sin-margen">Para pedir ajustes escribe un comentario.</p>
          )}
        </div>
      )}

      {trabajo.estado === 'conquistado' && (
        <div className="nota nota-aprobado">
          🏆 Territorio conquistado el {fechaCorta(trabajo.conquistadoEn)}. ¡Buen trabajo
          {esDueno ? '' : ` de ${scout?.nombre}`}!
        </div>
      )}

      {/* Historial de revisiones */}
      {trabajo.revisiones.length > 0 && (
        <>
          <div className="seccion-titulo">
            <h2>📜 Historial de realimentación</h2>
          </div>
          <div className="tarjeta">
            <div className="linea-tiempo">
              {trabajo.revisiones.map((r) => (
                <div key={r.id} className="evento evento-revision">
                  <div className="evento-fecha">
                    {fechaHora(r.fecha)} · {buscarUsuario(state, r.autorId)?.nombre || 'Dirigente'} ·{' '}
                    {r.decision === 'aprobado' ? '✅ Aprobado' : '✏️ Ajustes'}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{r.comentario}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Modal abierto={confirmarEliminar} onCerrar={() => setConfirmarEliminar(false)} titulo="¿Abandonar esta conquista?">
        <p>
          Se eliminará el plan y {trabajo.avances.length} avance{trabajo.avances.length === 1 ? '' : 's'} de{' '}
          <strong>{territorio.nombre}</strong> ({nivel.nombre}). Esta acción no se puede deshacer.
        </p>
        <div className="fila-botones">
          <button
            className="btn btn-peligro"
            onClick={() => {
              dispatch({ type: 'trabajo/eliminar', trabajoId: trabajo.id });
              setConfirmarEliminar(false);
              alVolver();
            }}
          >
            Sí, abandonar
          </button>
          <button className="btn btn-secundario" onClick={() => setConfirmarEliminar(false)}>
            No, continuar
          </button>
        </div>
      </Modal>
    </div>
  );
}
