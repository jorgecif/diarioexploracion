// Lógica de cálculo de la progresión: niveles por ruta e insignias.
import { RUTAS, INSIGNIAS, NIVEL_ORDEN, TERRITORIOS_POR_NIVEL } from '../data/progresion.js';

export const ESTADOS = {
  planeando: {
    id: 'planeando',
    nombre: 'Planeando',
    icono: '📝',
    color: '#8a7f6d',
    descripcion: 'Estás definiendo tu plan de conquista.',
  },
  en_progreso: {
    id: 'en_progreso',
    nombre: 'En progreso',
    icono: '🚶',
    color: '#2e7d32',
    descripcion: 'Estás trabajando el territorio y registrando avances.',
  },
  en_revision: {
    id: 'en_revision',
    nombre: 'En revisión',
    icono: '⏳',
    color: '#e6a817',
    descripcion: 'Enviado al dirigente para su revisión.',
  },
  conquistado: {
    id: 'conquistado',
    nombre: 'Conquistado',
    icono: '🚩',
    color: '#e87722',
    descripcion: '¡Territorio conquistado! Aprobado por tu dirigente.',
  },
};

export function estadoInfo(id) {
  return ESTADOS[id] || ESTADOS.planeando;
}

/** Trabajos de un scout. */
export function trabajosDeScout(state, scoutId) {
  return state.trabajos.filter((t) => t.scoutId === scoutId);
}

/**
 * Nivel alcanzado por el scout en cada ruta.
 * Una ruta alcanza un nivel cuando el scout ha CONQUISTADO al menos
 * TERRITORIOS_POR_NIVEL territorios de esa ruta en ese nivel.
 * Devuelve: { [rutaId]: { nivelAlcanzado: 'descubro'|null, conquistadosPorNivel, enCurso } }
 */
export function progresoRutas(state, scoutId) {
  const trabajos = trabajosDeScout(state, scoutId);
  const res = {};
  for (const ruta of RUTAS) {
    const idsTerritorios = new Set(ruta.territorios.map((t) => t.id));
    const deRuta = trabajos.filter((t) => idsTerritorios.has(t.territorioId));
    const conquistadosPorNivel = { descubro: 0, construyo: 0, conquisto: 0 };
    for (const t of deRuta) {
      if (t.estado === 'conquistado') conquistadosPorNivel[t.nivel] += 1;
    }
    let nivelAlcanzado = null;
    for (const nivel of ['descubro', 'construyo', 'conquisto']) {
      if (conquistadosPorNivel[nivel] >= TERRITORIOS_POR_NIVEL) nivelAlcanzado = nivel;
    }
    res[ruta.id] = {
      nivelAlcanzado,
      conquistadosPorNivel,
      enCurso: deRuta.filter((t) => t.estado !== 'conquistado').length,
      totalConquistados: deRuta.filter((t) => t.estado === 'conquistado').length,
      trabajos: deRuta,
    };
  }
  return res;
}

function ordenNivel(nivelId) {
  return nivelId ? NIVEL_ORDEN[nivelId] : 0;
}

/**
 * Verifica si un conjunto de niveles alcanzados por ruta cumple los requisitos
 * de una insignia. Los requisitos se consumen de mayor a menor exigencia
 * asignando rutas distintas a cada uno.
 */
export function cumpleInsignia(nivelesPorRuta, insignia) {
  const disponibles = Object.values(nivelesPorRuta)
    .map((r) => ordenNivel(r.nivelAlcanzado))
    .sort((a, b) => b - a);
  let idx = 0;
  for (const req of insignia.requisitos) {
    const minimo = NIVEL_ORDEN[req.nivel];
    let asignadas = 0;
    while (asignadas < req.cantidad && idx < disponibles.length) {
      if (disponibles[idx] >= minimo) {
        asignadas += 1;
        idx += 1;
      } else {
        idx += 1;
      }
    }
    if (asignadas < req.cantidad) return false;
  }
  return true;
}

/**
 * Insignia actual del scout y la siguiente por alcanzar.
 * Devuelve { actual: insignia|null, siguiente: insignia|null, faltante: string[] }
 */
export function insigniaDeScout(state, scoutId) {
  const niveles = progresoRutas(state, scoutId);
  let actual = null;
  for (const ins of INSIGNIAS) {
    if (cumpleInsignia(niveles, ins)) actual = ins;
  }
  const siguiente = actual
    ? INSIGNIAS.find((i) => i.orden === actual.orden + 1) || null
    : INSIGNIAS[0];
  const faltante = siguiente ? faltanteParaInsignia(niveles, siguiente) : [];
  return { actual, siguiente, faltante, niveles };
}

function faltanteParaInsignia(nivelesPorRuta, insignia) {
  // Descripción sencilla de lo que falta: cuenta rutas al menos en cada nivel.
  const cuenta = { descubro: 0, construyo: 0, conquisto: 0 };
  for (const r of Object.values(nivelesPorRuta)) {
    const orden = ordenNivel(r.nivelAlcanzado);
    if (orden >= 1) cuenta.descubro += 1;
    if (orden >= 2) cuenta.construyo += 1;
    if (orden >= 3) cuenta.conquisto += 1;
  }
  const faltas = [];
  // Requisitos acumulados: los de mayor exigencia también cuentan para los menores.
  let acumulado = 0;
  for (const req of insignia.requisitos) {
    acumulado += req.cantidad;
    const nombres = { descubro: 'Descubro', construyo: 'Construyo', conquisto: 'Conquisto' };
    const tiene = cuenta[req.nivel];
    if (tiene < acumulado) {
      faltas.push(
        `${acumulado - tiene} ruta${acumulado - tiene === 1 ? '' : 's'} más en ${nombres[req.nivel]} (tienes ${tiene})`
      );
    }
  }
  return faltas;
}

/** Resumen de un scout para tarjetas de patrulla/tropa. */
export function resumenScout(state, scoutId) {
  const trabajos = trabajosDeScout(state, scoutId);
  const { actual, siguiente, niveles } = insigniaDeScout(state, scoutId);
  return {
    scoutId,
    insignia: actual,
    siguienteInsignia: siguiente,
    niveles,
    conquistados: trabajos.filter((t) => t.estado === 'conquistado').length,
    enProgreso: trabajos.filter((t) => t.estado === 'en_progreso' || t.estado === 'planeando').length,
    enRevision: trabajos.filter((t) => t.estado === 'en_revision').length,
    trabajos,
  };
}

/** Scouts de una patrulla. */
export function scoutsDePatrulla(state, patrullaId) {
  return state.usuarios.filter((u) => u.rol === 'scout' && u.patrullaId === patrullaId);
}

/** Scouts de una tropa. */
export function scoutsDeTropa(state, tropaId) {
  return state.usuarios.filter((u) => u.rol === 'scout' && u.tropaId === tropaId);
}

export function jefesDeTropa(state, tropaId) {
  return state.usuarios.filter((u) => u.rol === 'jefe' && u.tropaId === tropaId);
}

export function patrullasDeTropa(state, tropaId) {
  return state.patrullas.filter((p) => p.tropaId === tropaId);
}

/** Trabajos pendientes de revisión en una tropa. */
export function revisionesPendientes(state, tropaId) {
  const scouts = new Set(scoutsDeTropa(state, tropaId).map((s) => s.id));
  return state.trabajos.filter((t) => scouts.has(t.scoutId) && t.estado === 'en_revision');
}

export function usuario(state, id) {
  return state.usuarios.find((u) => u.id === id);
}

export function patrulla(state, id) {
  return state.patrullas.find((p) => p.id === id);
}

export function tropa(state, id) {
  return state.tropas.find((t) => t.id === id);
}

/** Último comentario de revisión (realimentación) de un trabajo. */
export function ultimaRevision(trabajo) {
  if (!trabajo.revisiones || trabajo.revisiones.length === 0) return null;
  return trabajo.revisiones[trabajo.revisiones.length - 1];
}

export function fechaCorta(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fechaHora(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
