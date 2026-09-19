// Reducer puro del estado de la aplicación.
// Lo comparten el cliente (React) y el servidor (Express): el servidor es
// quien lo ejecuta de verdad; el cliente solo recibe el estado resultante.
import { crearSeed } from '../data/seed.js';
import { hashContrasena, generarCodigo, sugerirUsuario, CONTRASENA_DEMO } from './auth.js';
import { avatarPorDefecto } from '../data/avatares.js';

export function uid(prefijo = 'id') {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ahora() {
  return new Date().toISOString();
}

export function estadoVacio() {
  return { version: 2, revision: 0, demo: false, tropas: [], patrullas: [], usuarios: [], trabajos: [] };
}

/**
 * Migra estados guardados por versiones anteriores.
 * v1 → v2: agrega credenciales (correo/contraseña) a los usuarios, códigos de
 * invitación a las tropas y garantiza que exista una cuenta de administrador.
 * Todas las cuentas migradas quedan con la contraseña de demostración.
 */
export function migrar(datos) {
  if ((datos.version || 1) >= 2) return datos;
  const claveDemo = hashContrasena(CONTRASENA_DEMO);
  for (const t of datos.tropas) {
    if (!t.codigoScout) t.codigoScout = generarCodigo();
    if (!t.codigoDirigente) t.codigoDirigente = generarCodigo();
  }
  for (const u of datos.usuarios) {
    if (!u.correo) u.correo = sugerirUsuario(datos, u.nombre);
    if (!u.contrasena) u.contrasena = claveDemo;
    delete u.pin; // el PIN de dirigente quedó reemplazado por la contraseña
  }
  if (!datos.usuarios.some((u) => u.rol === 'admin')) {
    datos.usuarios.unshift({
      id: 'admin-1',
      tropaId: null,
      rol: 'admin',
      nombre: 'Administración',
      avatar: '🛡️',
      correo: 'admin',
      contrasena: claveDemo,
    });
  }
  datos.version = 2;
  datos.demo = true; // se migró con contraseñas de demostración: mostrar el aviso
  return datos;
}

function actualizarTrabajo(state, trabajoId, fn) {
  return {
    ...state,
    trabajos: state.trabajos.map((t) =>
      t.id === trabajoId ? { ...fn(t), actualizado: ahora() } : t
    ),
  };
}

export function reducer(state, accion) {
  switch (accion.type) {
    // ---------- Trabajos (territorios en conquista) ----------
    case 'trabajo/crear': {
      const { scoutId, territorioId, nivel } = accion;
      const nuevo = {
        id: accion.id || uid('tr'),
        scoutId,
        territorioId,
        nivel,
        estado: 'planeando',
        plan: { texto: '', acordado: null, actualizado: null },
        avances: [],
        revisiones: [],
        creado: ahora(),
        actualizado: ahora(),
      };
      return { ...state, trabajos: [...state.trabajos, nuevo] };
    }
    case 'trabajo/eliminar':
      return { ...state, trabajos: state.trabajos.filter((t) => t.id !== accion.trabajoId) };
    case 'trabajo/plan':
      return actualizarTrabajo(state, accion.trabajoId, (t) => ({
        ...t,
        plan: { ...t.plan, texto: accion.texto, actualizado: ahora() },
      }));
    case 'trabajo/plan-acordado':
      return actualizarTrabajo(state, accion.trabajoId, (t) => ({
        ...t,
        estado: t.estado === 'planeando' ? 'en_progreso' : t.estado,
        plan: {
          ...t.plan,
          acordado: accion.quitar ? null : { por: accion.usuarioId, fecha: ahora() },
        },
      }));
    case 'trabajo/avance':
      return actualizarTrabajo(state, accion.trabajoId, (t) => ({
        ...t,
        estado: t.estado === 'planeando' ? 'en_progreso' : t.estado,
        avances: [
          ...t.avances,
          { id: uid('av'), fecha: ahora(), autorId: accion.autorId, texto: accion.texto },
        ],
      }));
    case 'trabajo/avance-eliminar':
      return actualizarTrabajo(state, accion.trabajoId, (t) => ({
        ...t,
        avances: t.avances.filter((a) => a.id !== accion.avanceId),
      }));
    case 'trabajo/enviar-revision':
      return actualizarTrabajo(state, accion.trabajoId, (t) => ({
        ...t,
        estado: 'en_revision',
        enviadoEn: ahora(),
      }));
    case 'trabajo/retirar-revision':
      return actualizarTrabajo(state, accion.trabajoId, (t) => ({
        ...t,
        estado: 'en_progreso',
      }));
    case 'trabajo/revisar': {
      // decision: 'aprobado' | 'ajustes'
      const { trabajoId, autorId, decision, comentario } = accion;
      return actualizarTrabajo(state, trabajoId, (t) => ({
        ...t,
        estado: decision === 'aprobado' ? 'conquistado' : 'en_progreso',
        conquistadoEn: decision === 'aprobado' ? ahora() : t.conquistadoEn,
        revisiones: [
          ...t.revisiones,
          { id: uid('rev'), fecha: ahora(), autorId, decision, comentario },
        ],
      }));
    }
    case 'trabajo/nivel':
      return actualizarTrabajo(state, accion.trabajoId, (t) => ({ ...t, nivel: accion.nivel }));

    // ---------- Gestión de personas ----------
    case 'usuario/crear': {
      const rol = accion.usuario.rol || 'scout';
      const u = {
        id: uid(rol),
        avatar: avatarPorDefecto(rol),
        creado: ahora(),
        ...accion.usuario,
      };
      return { ...state, usuarios: [...state.usuarios, u] };
    }
    case 'usuario/editar':
      return {
        ...state,
        usuarios: state.usuarios.map((u) =>
          u.id === accion.usuarioId ? { ...u, ...accion.cambios } : u
        ),
      };
    case 'usuario/eliminar':
      return {
        ...state,
        usuarios: state.usuarios.filter((u) => u.id !== accion.usuarioId),
        trabajos: state.trabajos.filter((t) => t.scoutId !== accion.usuarioId),
      };

    case 'patrulla/crear':
      return {
        ...state,
        patrullas: [
          ...state.patrullas,
          { id: uid('pat'), emblema: '🐾', color: '#2c6e31', ...accion.patrulla },
        ],
      };
    case 'patrulla/editar':
      return {
        ...state,
        patrullas: state.patrullas.map((p) =>
          p.id === accion.patrullaId ? { ...p, ...accion.cambios } : p
        ),
      };
    case 'patrulla/eliminar':
      return {
        ...state,
        patrullas: state.patrullas.filter((p) => p.id !== accion.patrullaId),
        usuarios: state.usuarios.map((u) =>
          u.patrullaId === accion.patrullaId ? { ...u, patrullaId: null } : u
        ),
      };

    case 'tropa/crear':
      return {
        ...state,
        tropas: [
          ...state.tropas,
          {
            id: uid('tropa'),
            creada: ahora(),
            codigoScout: generarCodigo(),
            codigoDirigente: generarCodigo(),
            ...accion.tropa,
          },
        ],
      };
    case 'tropa/editar':
      return {
        ...state,
        tropas: state.tropas.map((t) =>
          t.id === accion.tropaId ? { ...t, ...accion.cambios } : t
        ),
      };
    case 'tropa/eliminar': {
      const usuariosDeTropa = new Set(
        state.usuarios.filter((u) => u.tropaId === accion.tropaId).map((u) => u.id)
      );
      return {
        ...state,
        tropas: state.tropas.filter((t) => t.id !== accion.tropaId),
        patrullas: state.patrullas.filter((p) => p.tropaId !== accion.tropaId),
        usuarios: state.usuarios.filter((u) => u.tropaId !== accion.tropaId),
        trabajos: state.trabajos.filter((t) => !usuariosDeTropa.has(t.scoutId)),
      };
    }

    // ---------- Datos ----------
    case 'datos/importar':
      return migrar(accion.datos);
    case 'datos/reiniciar-demo':
      return crearSeed();
    case 'datos/vaciar':
      return estadoVacio();
    case 'datos/demo-off':
      return { ...state, demo: false };

    default:
      return state;
  }
}
