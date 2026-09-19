import React, { useState } from 'react';
import { useApp } from '../../state/store.jsx';
import { useNav, useSesion } from '../../state/nav.jsx';
import {
  scoutsDeTropa,
  jefesDeTropa,
  patrullasDeTropa,
  tropa as buscarTropa,
} from '../../state/logica.js';
import { usuarioDisponible, sugerirUsuario, generarCodigo } from '../../state/auth.js';
import { avataresPorRol, EMBLEMAS_PATRULLA } from '../../data/avatares.js';
import { Avatar, Modal } from '../../components/comunes.jsx';

/** Gestión de la tropa (dirigente): patrullas, scouts, dirigentes y códigos. */
export default function Gestion() {
  const { state, dispatch } = useApp();
  const { navegar } = useNav();
  const { usuario } = useSesion();

  const miTropa = buscarTropa(state, usuario.tropaId);
  const scouts = scoutsDeTropa(state, usuario.tropaId);
  const jefes = jefesDeTropa(state, usuario.tropaId);
  const patrullas = patrullasDeTropa(state, usuario.tropaId);

  const [editandoUsuario, setEditandoUsuario] = useState(null); // {usuario, esNuevo}
  const [editandoPatrulla, setEditandoPatrulla] = useState(null);
  const [confirmando, setConfirmando] = useState(null); // {texto, accion}

  function exportar() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progresion-scout-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 style={{ color: 'var(--verde)' }}>⚙️ Gestión de {miTropa?.nombre}</h2>

      {/* ---- Códigos de invitación ---- */}
      <div className="tarjeta">
        <h3>🎟️ Códigos de invitación</h3>
        <p className="pequeno suave">
          Compártelos para que cada quien cree su propia cuenta en la pantalla de ingreso: el
          código de scouts para los muchachos y el de dirigentes solo para el equipo de dirigentes.
        </p>
        <div className="grid-2">
          <TarjetaCodigo
            titulo="Para scouts"
            codigo={miTropa?.codigoScout}
            onRegenerar={() =>
              dispatch({ type: 'tropa/editar', tropaId: miTropa.id, cambios: { codigoScout: generarCodigo() } })
            }
          />
          <TarjetaCodigo
            titulo="Para dirigentes"
            codigo={miTropa?.codigoDirigente}
            onRegenerar={() =>
              dispatch({ type: 'tropa/editar', tropaId: miTropa.id, cambios: { codigoDirigente: generarCodigo() } })
            }
          />
        </div>
      </div>

      {/* ---- Patrullas ---- */}
      <div className="seccion-titulo">
        <h2>⛺ Patrullas</h2>
        <button
          className="btn btn-secundario"
          onClick={() => setEditandoPatrulla({ patrulla: { nombre: '', emblema: '🐾', color: '#2c6e31', tropaId: usuario.tropaId }, esNueva: true })}
        >
          ➕ Nueva patrulla
        </button>
      </div>
      {patrullas.map((p) => {
        const miembros = scouts.filter((s) => s.patrullaId === p.id);
        return (
          <div key={p.id} className="tarjeta">
            <div className="fila-separada">
              <strong>
                {p.emblema} {p.nombre} <span className="pequeno suave">({miembros.length} scouts)</span>
              </strong>
              <div className="fila" style={{ gap: 4 }}>
                <button className="btn-icono" title="Editar" onClick={() => setEditandoPatrulla({ patrulla: p, esNueva: false })}>
                  ✏️
                </button>
                <button
                  className="btn-icono"
                  title="Eliminar"
                  onClick={() =>
                    setConfirmando({
                      texto: `¿Eliminar la patrulla ${p.nombre}? Sus scouts quedarán sin patrulla (no se borran).`,
                      accion: () => dispatch({ type: 'patrulla/eliminar', patrullaId: p.id }),
                    })
                  }
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* ---- Scouts ---- */}
      <div className="seccion-titulo">
        <h2>🧑‍🤝‍🧑 Scouts ({scouts.length})</h2>
        <button
          className="btn btn-secundario"
          onClick={() =>
            setEditandoUsuario({
              usuario: { nombre: '', correo: '', rol: 'scout', avatar: '🦊', patrullaId: patrullas[0]?.id || null, tropaId: usuario.tropaId },
              esNuevo: true,
            })
          }
        >
          ➕ Nuevo scout
        </button>
      </div>
      <div className="tarjeta">
        {scouts.length === 0 && (
          <p className="suave centrado sin-margen">
            Aún no hay scouts. Crea sus cuentas aquí o comparte el código de invitación para que se
            registren solos.
          </p>
        )}
        {scouts
          .slice()
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .map((s) => (
            <div key={s.id} className="fila-separada" style={{ padding: '7px 0', borderBottom: '1px solid var(--borde)' }}>
              <span
                className="fila"
                style={{ gap: 8, cursor: 'pointer', flex: 1, minWidth: 0 }}
                onClick={() => navegar({ v: 'scout-detalle', scoutId: s.id })}
                title="Ver progresión"
              >
                <Avatar usuario={s} tam={32} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.nombre}
                  <span className="pequeno suave" style={{ display: 'block' }}>{s.correo}</span>
                </span>
              </span>
              <select
                value={s.patrullaId || ''}
                style={{ width: 150 }}
                onChange={(e) =>
                  dispatch({ type: 'usuario/editar', usuarioId: s.id, cambios: { patrullaId: e.target.value || null } })
                }
              >
                <option value="">Sin patrulla</option>
                {patrullas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emblema} {p.nombre}
                  </option>
                ))}
              </select>
              <button className="btn-icono" title="Editar" onClick={() => setEditandoUsuario({ usuario: s, esNuevo: false })}>
                ✏️
              </button>
            </div>
          ))}
      </div>

      {/* ---- Dirigentes ---- */}
      <div className="seccion-titulo">
        <h2>🧑‍🏫 Dirigentes ({jefes.length})</h2>
        <button
          className="btn btn-secundario"
          onClick={() =>
            setEditandoUsuario({
              usuario: { nombre: '', correo: '', rol: 'jefe', avatar: '🧭', tropaId: usuario.tropaId },
              esNuevo: true,
            })
          }
        >
          ➕ Nuevo dirigente
        </button>
      </div>
      <div className="tarjeta">
        {jefes.map((j) => (
          <div key={j.id} className="fila-separada" style={{ padding: '7px 0', borderBottom: '1px solid var(--borde)' }}>
            <span className="fila" style={{ gap: 8 }}>
              <Avatar usuario={j} tam={32} />
              <span>
                {j.nombre} {j.id === usuario.id && <span className="pequeno suave">(tú)</span>}
                <span className="pequeno suave" style={{ display: 'block' }}>{j.correo}</span>
              </span>
            </span>
            <button className="btn-icono" title="Editar" onClick={() => setEditandoUsuario({ usuario: j, esNuevo: false })}>
              ✏️
            </button>
          </div>
        ))}
      </div>

      {/* ---- Tropa y copia de seguridad ---- */}
      <div className="seccion-titulo">
        <h2>🏕️ Tropa</h2>
      </div>
      <div className="tarjeta">
        <label>Nombre de la tropa</label>
        <input
          value={miTropa?.nombre || ''}
          onChange={(e) => dispatch({ type: 'tropa/editar', tropaId: miTropa.id, cambios: { nombre: e.target.value } })}
        />
        <label>Grupo scout</label>
        <input
          value={miTropa?.grupo || ''}
          onChange={(e) => dispatch({ type: 'tropa/editar', tropaId: miTropa.id, cambios: { grupo: e.target.value } })}
        />
        <p className="pequeno suave mt">
          Los datos se guardan en la nube (Supabase) y se sincronizan entre los dispositivos de
          todos los miembros. Puedes descargar una copia en JSON cuando quieras.
        </p>
        <div className="fila-botones">
          <button className="btn btn-secundario" onClick={exportar}>
            ⬇️ Descargar copia (JSON)
          </button>
        </div>
      </div>

      {/* ---- Modales ---- */}
      <ModalUsuario
        editando={editandoUsuario}
        patrullas={patrullas}
        onCerrar={() => setEditandoUsuario(null)}
        onGuardar={(borrador, esNuevo, contrasenaNueva) => {
          const datos = { ...borrador };
          if (contrasenaNueva) datos.contrasena = contrasenaNueva;
          if (esNuevo) dispatch({ type: 'usuario/crear', usuario: datos });
          else {
            const { id, ...cambios } = datos;
            dispatch({ type: 'usuario/editar', usuarioId: id, cambios });
          }
          setEditandoUsuario(null);
        }}
        onEliminar={(u) => {
          setEditandoUsuario(null);
          setConfirmando({
            texto: `¿Eliminar a ${u.nombre}? ${u.rol === 'scout' ? 'Se borrarán también todas sus conquistas.' : ''}`,
            accion: () => dispatch({ type: 'usuario/eliminar', usuarioId: u.id }),
          });
        }}
        esYo={(u) => u.id === usuario.id}
      />

      <ModalPatrulla
        editando={editandoPatrulla}
        onCerrar={() => setEditandoPatrulla(null)}
        onGuardar={(p, esNueva) => {
          if (esNueva) dispatch({ type: 'patrulla/crear', patrulla: p });
          else dispatch({ type: 'patrulla/editar', patrullaId: p.id, cambios: p });
          setEditandoPatrulla(null);
        }}
      />

      <Modal abierto={Boolean(confirmando)} onCerrar={() => setConfirmando(null)} titulo="Confirmar">
        <p>{confirmando?.texto}</p>
        <div className="fila-botones">
          <button
            className="btn btn-peligro"
            onClick={() => {
              confirmando.accion();
              setConfirmando(null);
            }}
          >
            Sí, continuar
          </button>
          <button className="btn btn-secundario" onClick={() => setConfirmando(null)}>
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

function ModalUsuario({ editando, patrullas, onCerrar, onGuardar, onEliminar, esYo }) {
  const { state } = useApp();
  const [borrador, setBorrador] = useState(null);
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [clave, setClave] = useState(null);

  if (editando && clave !== editando) {
    setClave(editando);
    setBorrador({ ...editando.usuario });
    setContrasena('');
    setError('');
    return null;
  }
  if (!editando || !borrador) return null;

  const esJefe = borrador.rol === 'jefe';
  const avatares = avataresPorRol(borrador.rol);

  function guardar() {
    if (!usuarioDisponible(state, borrador.correo, borrador.id || null)) {
      setError('Ese correo o usuario ya está en uso.');
      return;
    }
    if (editando.esNuevo && contrasena.length < 6) {
      setError('Define una contraseña inicial de al menos 6 caracteres.');
      return;
    }
    if (!editando.esNuevo && contrasena && contrasena.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    onGuardar(borrador, editando.esNuevo, contrasena);
  }

  return (
    <Modal
      abierto={Boolean(editando)}
      onCerrar={onCerrar}
      titulo={editando.esNuevo ? (esJefe ? 'Nuevo dirigente' : 'Nuevo scout') : `Editar: ${editando.usuario.nombre}`}
    >
      <label>Nombre *</label>
      <input value={borrador.nombre} onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })} autoFocus />

      <label>Correo o usuario * <span className="suave">(para iniciar sesión)</span></label>
      <div className="fila">
        <input
          value={borrador.correo || ''}
          autoCapitalize="none"
          onChange={(e) => {
            setBorrador({ ...borrador, correo: e.target.value });
            setError('');
          }}
        />
        {editando.esNuevo && (
          <button
            type="button"
            className="btn btn-secundario"
            style={{ whiteSpace: 'nowrap' }}
            disabled={!borrador.nombre.trim()}
            onClick={() => setBorrador({ ...borrador, correo: sugerirUsuario(state, borrador.nombre) })}
          >
            💡 Sugerir
          </button>
        )}
      </div>

      <label>{editando.esNuevo ? 'Contraseña inicial *' : 'Restablecer contraseña (opcional)'}</label>
      <input
        type="text"
        value={contrasena}
        placeholder={editando.esNuevo ? 'Podrá cambiarla en «Mi cuenta»' : 'Déjalo vacío para no cambiarla'}
        onChange={(e) => {
          setContrasena(e.target.value);
          setError('');
        }}
      />

      <label>Avatar</label>
      <div className="fila" style={{ flexWrap: 'wrap', gap: 6 }}>
        {avatares.map((a) => (
          <button
            key={a}
            type="button"
            className="btn-icono"
            style={{
              fontSize: '1.4rem',
              border: borrador.avatar === a ? '2px solid var(--verde-claro)' : '2px solid transparent',
              background: borrador.avatar === a ? 'var(--verde-suave)' : 'none',
            }}
            onClick={() => setBorrador({ ...borrador, avatar: a })}
          >
            {a}
          </button>
        ))}
      </div>

      {!esJefe && (
        <>
          <label>Patrulla</label>
          <select
            value={borrador.patrullaId || ''}
            onChange={(e) => setBorrador({ ...borrador, patrullaId: e.target.value || null })}
          >
            <option value="">Sin patrulla</option>
            {patrullas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emblema} {p.nombre}
              </option>
            ))}
          </select>
        </>
      )}

      {error && <p style={{ color: 'var(--rojo)' }} className="mt sin-margen">{error}</p>}

      <div className="fila-botones">
        <button className="btn" disabled={!borrador.nombre.trim() || !(borrador.correo || '').trim()} onClick={guardar}>
          💾 Guardar
        </button>
        {!editando.esNuevo && !esYo(editando.usuario) && (
          <button className="btn btn-peligro" onClick={() => onEliminar(editando.usuario)}>
            🗑️ Eliminar
          </button>
        )}
      </div>
    </Modal>
  );
}

function ModalPatrulla({ editando, onCerrar, onGuardar }) {
  const [borrador, setBorrador] = useState(null);
  const [clave, setClave] = useState(null);

  if (editando && clave !== editando) {
    setClave(editando);
    setBorrador({ ...editando.patrulla });
    return null;
  }
  if (!editando || !borrador) return null;

  return (
    <Modal abierto={Boolean(editando)} onCerrar={onCerrar} titulo={editando.esNueva ? 'Nueva patrulla' : `Editar: ${editando.patrulla.nombre}`}>
      <label>Nombre *</label>
      <input value={borrador.nombre} onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })} autoFocus placeholder="Ej: Águilas" />
      <label>Emblema</label>
      <div className="fila" style={{ flexWrap: 'wrap', gap: 6 }}>
        {EMBLEMAS_PATRULLA.map((e) => (
          <button
            key={e}
            type="button"
            className="btn-icono"
            style={{
              fontSize: '1.4rem',
              border: borrador.emblema === e ? '2px solid var(--verde-claro)' : '2px solid transparent',
              background: borrador.emblema === e ? 'var(--verde-suave)' : 'none',
            }}
            onClick={() => setBorrador({ ...borrador, emblema: e })}
          >
            {e}
          </button>
        ))}
      </div>
      <label>Color</label>
      <input type="color" value={borrador.color || '#2c6e31'} onChange={(e) => setBorrador({ ...borrador, color: e.target.value })} style={{ height: 44, padding: 4 }} />
      <div className="fila-botones">
        <button className="btn" disabled={!borrador.nombre.trim()} onClick={() => onGuardar(borrador, editando.esNueva)}>
          💾 Guardar
        </button>
      </div>
    </Modal>
  );
}
