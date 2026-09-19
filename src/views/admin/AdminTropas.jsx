import React, { useState } from 'react';
import { useApp } from '../../state/store.jsx';
import { generarCodigo } from '../../state/auth.js';
import { jefesDeTropa, scoutsDeTropa, patrullasDeTropa } from '../../state/logica.js';
import { Modal, Vacio } from '../../components/comunes.jsx';

/** Administración: tropas y sus códigos de invitación. */
export default function AdminTropas() {
  const { state, dispatch } = useApp();
  const [editando, setEditando] = useState(null); // {tropa, esNueva}
  const [eliminando, setEliminando] = useState(null);

  return (
    <div>
      <div className="seccion-titulo" style={{ marginTop: 0 }}>
        <h2>🏕️ Tropas ({state.tropas.length})</h2>
        <button
          className="btn"
          onClick={() => setEditando({ tropa: { nombre: '', grupo: '' }, esNueva: true })}
        >
          ➕ Nueva tropa
        </button>
      </div>

      {state.tropas.length === 0 && (
        <Vacio
          icono="🏕️"
          titulo="Aún no hay tropas"
          texto="Crea la primera tropa y comparte sus códigos de invitación para que dirigentes y scouts se registren."
        />
      )}

      {state.tropas.map((t) => {
        const jefes = jefesDeTropa(state, t.id);
        const scouts = scoutsDeTropa(state, t.id);
        const patrullas = patrullasDeTropa(state, t.id);
        return (
          <div key={t.id} className="tarjeta">
            <div className="fila-separada">
              <div>
                <h3 className="sin-margen">{t.nombre}</h3>
                <p className="suave pequeno sin-margen">
                  {t.grupo || 'Sin grupo'} · {jefes.length} dirigentes · {scouts.length} scouts ·{' '}
                  {patrullas.length} patrullas
                </p>
              </div>
              <div className="fila" style={{ gap: 4 }}>
                <button className="btn-icono" title="Editar" onClick={() => setEditando({ tropa: t, esNueva: false })}>
                  ✏️
                </button>
                <button className="btn-icono" title="Eliminar" onClick={() => setEliminando(t)}>
                  🗑️
                </button>
              </div>
            </div>

            <div className="grid-2 mt">
              <TarjetaCodigo
                titulo="Código para scouts"
                codigo={t.codigoScout}
                onRegenerar={() =>
                  dispatch({ type: 'tropa/editar', tropaId: t.id, cambios: { codigoScout: generarCodigo() } })
                }
              />
              <TarjetaCodigo
                titulo="Código para dirigentes"
                codigo={t.codigoDirigente}
                onRegenerar={() =>
                  dispatch({ type: 'tropa/editar', tropaId: t.id, cambios: { codigoDirigente: generarCodigo() } })
                }
              />
            </div>
            <p className="pequeno suave sin-margen mt">
              Quien se registre con un código entra a esta tropa con el rol correspondiente. Si un
              código se filtra, regenéralo: los usuarios ya registrados no se afectan.
            </p>
          </div>
        );
      })}

      <ModalTropa
        editando={editando}
        onCerrar={() => setEditando(null)}
        onGuardar={(t, esNueva) => {
          if (esNueva) dispatch({ type: 'tropa/crear', tropa: { nombre: t.nombre.trim(), grupo: t.grupo.trim() } });
          else dispatch({ type: 'tropa/editar', tropaId: t.id, cambios: { nombre: t.nombre.trim(), grupo: t.grupo.trim() } });
          setEditando(null);
        }}
      />

      <Modal abierto={Boolean(eliminando)} onCerrar={() => setEliminando(null)} titulo="¿Eliminar tropa?">
        <p>
          Se eliminará <strong>{eliminando?.nombre}</strong> con sus patrullas, sus{' '}
          {eliminando ? scoutsDeTropa(state, eliminando.id).length : 0} scouts, sus dirigentes y
          todas sus conquistas. Esta acción no se puede deshacer.
        </p>
        <div className="fila-botones">
          <button
            className="btn btn-peligro"
            onClick={() => {
              dispatch({ type: 'tropa/eliminar', tropaId: eliminando.id });
              setEliminando(null);
            }}
          >
            Sí, eliminar
          </button>
          <button className="btn btn-secundario" onClick={() => setEliminando(null)}>
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}

function TarjetaCodigo({ titulo, codigo, onRegenerar }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* sin portapapeles disponible */
    }
  }

  return (
    <div style={{ background: 'var(--verde-suave)', borderRadius: 12, padding: '10px 14px' }}>
      <div className="pequeno suave">{titulo}</div>
      <div className="fila-separada">
        <strong style={{ fontSize: '1.3rem', letterSpacing: '0.18em' }}>{codigo}</strong>
        <span>
          <button className="btn-icono" title="Copiar" onClick={copiar}>
            {copiado ? '✅' : '📋'}
          </button>
          <button className="btn-icono" title="Regenerar código" onClick={onRegenerar}>
            🔄
          </button>
        </span>
      </div>
    </div>
  );
}

function ModalTropa({ editando, onCerrar, onGuardar }) {
  const [borrador, setBorrador] = useState(null);
  const [clave, setClave] = useState(null);

  if (editando && clave !== editando) {
    setClave(editando);
    setBorrador({ ...editando.tropa });
    return null;
  }
  if (!editando || !borrador) return null;

  return (
    <Modal abierto onCerrar={onCerrar} titulo={editando.esNueva ? 'Nueva tropa' : `Editar: ${editando.tropa.nombre}`}>
      <label>Nombre de la tropa *</label>
      <input value={borrador.nombre} onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })} autoFocus placeholder="Ej: Tropa Cóndor" />
      <label>Grupo scout</label>
      <input value={borrador.grupo || ''} onChange={(e) => setBorrador({ ...borrador, grupo: e.target.value })} placeholder="Ej: Grupo Scout 1 Bogotá" />
      {editando.esNueva && (
        <p className="pequeno suave mt">
          Al crearla se generarán automáticamente sus códigos de invitación para scouts y dirigentes.
        </p>
      )}
      <div className="fila-botones">
        <button className="btn" disabled={!borrador.nombre.trim()} onClick={() => onGuardar(borrador, editando.esNueva)}>
          💾 Guardar
        </button>
      </div>
    </Modal>
  );
}
