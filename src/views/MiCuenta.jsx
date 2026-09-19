import React, { useState } from 'react';
import { useApp } from '../state/store.jsx';
import { useSesion } from '../state/nav.jsx';
import { Modal } from '../components/comunes.jsx';
import { avataresPorRol } from '../data/avatares.js';
import { usuarioDisponible } from '../state/auth.js';

const NOMBRE_ROL = { admin: 'Administrador', jefe: 'Dirigente', scout: 'Scout' };

/** Modal de cuenta: perfil, cambio de contraseña y cierre de sesión. */
export default function MiCuenta({ abierto, onCerrar }) {
  const { state, dispatch, cambiarMiContrasena } = useApp();
  const { usuario, salir } = useSesion();

  const [nombre, setNombre] = useState(usuario.nombre);
  const [correo, setCorreo] = useState(usuario.correo || '');
  const [avatar, setAvatar] = useState(usuario.avatar);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mensaje, setMensaje] = useState(null); // {tipo:'ok'|'error', texto}

  function guardarPerfil() {
    if (!nombre.trim()) return;
    if (!usuarioDisponible(state, correo, usuario.id)) {
      setMensaje({ tipo: 'error', texto: 'Ese correo o usuario ya está en uso.' });
      return;
    }
    dispatch({
      type: 'usuario/editar',
      usuarioId: usuario.id,
      cambios: { nombre: nombre.trim(), correo: correo.trim(), avatar },
    });
    setMensaje({ tipo: 'ok', texto: 'Perfil actualizado.' });
  }

  async function cambiarContrasena() {
    if (nueva.length < 6) {
      setMensaje({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (nueva !== confirmacion) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    try {
      await cambiarMiContrasena(actual, nueva);
      setActual('');
      setNueva('');
      setConfirmacion('');
      setMensaje({ tipo: 'ok', texto: 'Contraseña actualizada.' });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message });
    }
  }

  const cambioPerfil =
    nombre !== usuario.nombre || correo !== (usuario.correo || '') || avatar !== usuario.avatar;

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={`Mi cuenta · ${NOMBRE_ROL[usuario.rol] || ''}`}>
      <label>Nombre</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <label>Correo o usuario (para iniciar sesión)</label>
      <input value={correo} autoCapitalize="none" onChange={(e) => setCorreo(e.target.value)} />
      <label>Avatar</label>
      <div className="fila" style={{ flexWrap: 'wrap', gap: 6 }}>
        {avataresPorRol(usuario.rol).map((a) => (
          <button
            key={a}
            type="button"
            className="btn-icono"
            style={{
              fontSize: '1.4rem',
              border: avatar === a ? '2px solid var(--verde-claro)' : '2px solid transparent',
              background: avatar === a ? 'var(--verde-suave)' : 'none',
            }}
            onClick={() => setAvatar(a)}
          >
            {a}
          </button>
        ))}
      </div>
      {cambioPerfil && (
        <div className="fila-botones">
          <button className="btn" onClick={guardarPerfil} disabled={!nombre.trim() || !correo.trim()}>
            💾 Guardar perfil
          </button>
        </div>
      )}

      <h4 className="mt">🔒 Cambiar contraseña</h4>
      <label>Contraseña actual</label>
      <input type="password" value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" />
      <label>Nueva contraseña</label>
      <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" />
      <label>Repite la nueva contraseña</label>
      <input type="password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} autoComplete="new-password" />
      <div className="fila-botones">
        <button className="btn btn-secundario" onClick={cambiarContrasena} disabled={!actual || !nueva || !confirmacion}>
          🔒 Actualizar contraseña
        </button>
      </div>

      {mensaje && (
        <p className="mt sin-margen" style={{ color: mensaje.tipo === 'ok' ? 'var(--verde)' : 'var(--rojo)', fontWeight: 700 }}>
          {mensaje.texto}
        </p>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--borde)', margin: '16px 0' }} />
      <button
        className="btn btn-peligro"
        onClick={() => {
          onCerrar();
          salir();
        }}
      >
        🚪 Cerrar sesión
      </button>
    </Modal>
  );
}
