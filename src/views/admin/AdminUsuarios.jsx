import React, { useState } from 'react';
import { useApp } from '../../state/store.jsx';
import { useSesion } from '../../state/nav.jsx';
import { usuarioDisponible, sugerirUsuario } from '../../state/auth.js';
import { avataresPorRol, avatarPorDefecto } from '../../data/avatares.js';
import { Avatar, Modal } from '../../components/comunes.jsx';

const NOMBRE_ROL = { admin: '🛡️ Administrador', jefe: '🧭 Dirigente', scout: '🦊 Scout' };

/** Administración: todas las cuentas de la aplicación. */
export default function AdminUsuarios() {
  const { state, dispatch } = useApp();
  const { usuario: yo } = useSesion();
  const [filtroTropa, setFiltroTropa] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [editando, setEditando] = useState(null); // {usuario, esNuevo}
  const [eliminando, setEliminando] = useState(null);

  const usuarios = state.usuarios
    .filter((u) => !filtroTropa || u.tropaId === filtroTropa || (filtroTropa === 'sin' && !u.tropaId))
    .filter((u) => !filtroRol || u.rol === filtroRol)
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const totalAdmins = state.usuarios.filter((u) => u.rol === 'admin').length;

  function nombreTropa(id) {
    return state.tropas.find((t) => t.id === id)?.nombre || '—';
  }

  return (
    <div>
      <div className="seccion-titulo" style={{ marginTop: 0 }}>
        <h2>👥 Usuarios ({state.usuarios.length})</h2>
        <button
          className="btn"
          onClick={() =>
            setEditando({
              usuario: {
                nombre: '',
                correo: '',
                rol: 'scout',
                tropaId: state.tropas[0]?.id || null,
                avatar: avatarPorDefecto('scout'),
              },
              esNuevo: true,
            })
          }
        >
          ➕ Nuevo usuario
        </button>
      </div>

      <div className="tarjeta">
        <div className="grid-2">
          <div>
            <label style={{ marginTop: 0 }}>Filtrar por tropa</label>
            <select value={filtroTropa} onChange={(e) => setFiltroTropa(e.target.value)}>
              <option value="">Todas</option>
              {state.tropas.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
              <option value="sin">Sin tropa</option>
            </select>
          </div>
          <div>
            <label style={{ marginTop: 0 }}>Filtrar por rol</label>
            <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
              <option value="">Todos</option>
              <option value="admin">Administradores</option>
              <option value="jefe">Dirigentes</option>
              <option value="scout">Scouts</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tarjeta tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Tropa</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="fila" style={{ gap: 6 }}>
                    <Avatar usuario={u} tam={26} /> {u.nombre}
                    {u.id === yo.id && <span className="pequeno suave">(tú)</span>}
                  </span>
                </td>
                <td>{u.correo}</td>
                <td>{NOMBRE_ROL[u.rol] || u.rol}</td>
                <td>{u.rol === 'admin' ? '—' : nombreTropa(u.tropaId)}</td>
                <td>
                  <button className="btn-icono" title="Editar" onClick={() => setEditando({ usuario: u, esNuevo: false })}>
                    ✏️
                  </button>
                  {u.id !== yo.id && !(u.rol === 'admin' && totalAdmins <= 1) && (
                    <button className="btn-icono" title="Eliminar" onClick={() => setEliminando(u)}>
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && <p className="suave centrado mt sin-margen">No hay usuarios con ese filtro.</p>}
      </div>

      <ModalUsuarioAdmin
        editando={editando}
        onCerrar={() => setEditando(null)}
        onGuardar={(borrador, esNuevo, contrasenaNueva) => {
          const cambios = {
            nombre: borrador.nombre.trim(),
            correo: borrador.correo.trim(),
            rol: borrador.rol,
            tropaId: borrador.rol === 'admin' ? null : borrador.tropaId,
            patrullaId: borrador.rol === 'scout' ? borrador.patrullaId || null : null,
            avatar: borrador.avatar,
          };
          if (contrasenaNueva) cambios.contrasena = contrasenaNueva;
          if (esNuevo) dispatch({ type: 'usuario/crear', usuario: cambios });
          else dispatch({ type: 'usuario/editar', usuarioId: borrador.id, cambios });
          setEditando(null);
        }}
      />

      <Modal abierto={Boolean(eliminando)} onCerrar={() => setEliminando(null)} titulo="¿Eliminar usuario?">
        <p>
          Se eliminará la cuenta de <strong>{eliminando?.nombre}</strong>
          {eliminando?.rol === 'scout' ? ' junto con todas sus conquistas.' : '.'}
        </p>
        <div className="fila-botones">
          <button
            className="btn btn-peligro"
            onClick={() => {
              dispatch({ type: 'usuario/eliminar', usuarioId: eliminando.id });
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

function ModalUsuarioAdmin({ editando, onCerrar, onGuardar }) {
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

  const patrullas = state.patrullas.filter((p) => p.tropaId === borrador.tropaId);

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
    if (borrador.rol !== 'admin' && !borrador.tropaId) {
      setError('Elige la tropa a la que pertenece.');
      return;
    }
    onGuardar(borrador, editando.esNuevo, contrasena);
  }

  function cambiarRol(rol) {
    setBorrador({ ...borrador, rol, avatar: avataresPorRol(rol).includes(borrador.avatar) ? borrador.avatar : avatarPorDefecto(rol) });
  }

  return (
    <Modal abierto onCerrar={onCerrar} titulo={editando.esNuevo ? 'Nuevo usuario' : `Editar: ${editando.usuario.nombre}`}>
      <label>Nombre *</label>
      <input
        value={borrador.nombre}
        autoFocus
        onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })}
      />
      <label>Correo o usuario *</label>
      <div className="fila">
        <input
          value={borrador.correo}
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
      <label>Rol</label>
      <select value={borrador.rol} onChange={(e) => cambiarRol(e.target.value)}>
        <option value="scout">Scout</option>
        <option value="jefe">Dirigente</option>
        <option value="admin">Administrador de la aplicación</option>
      </select>
      {borrador.rol !== 'admin' && (
        <>
          <label>Tropa *</label>
          <select
            value={borrador.tropaId || ''}
            onChange={(e) => setBorrador({ ...borrador, tropaId: e.target.value || null, patrullaId: null })}
          >
            <option value="">Elegir…</option>
            {state.tropas.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </>
      )}
      {borrador.rol === 'scout' && borrador.tropaId && (
        <>
          <label>Patrulla</label>
          <select
            value={borrador.patrullaId || ''}
            onChange={(e) => setBorrador({ ...borrador, patrullaId: e.target.value || null })}
          >
            <option value="">Sin patrulla</option>
            {patrullas.map((p) => (
              <option key={p.id} value={p.id}>{p.emblema} {p.nombre}</option>
            ))}
          </select>
        </>
      )}
      <label>{editando.esNuevo ? 'Contraseña inicial *' : 'Restablecer contraseña (opcional)'}</label>
      <input
        type="text"
        value={contrasena}
        placeholder={editando.esNuevo ? 'El usuario podrá cambiarla luego' : 'Déjalo vacío para no cambiarla'}
        onChange={(e) => {
          setContrasena(e.target.value);
          setError('');
        }}
      />
      {error && <p style={{ color: 'var(--rojo)' }} className="mt sin-margen">{error}</p>}
      <div className="fila-botones">
        <button className="btn" disabled={!borrador.nombre.trim() || !borrador.correo.trim()} onClick={guardar}>
          💾 Guardar
        </button>
      </div>
    </Modal>
  );
}
