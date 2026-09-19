// ============================================================
// Autenticación local (sin servidor).
// Las contraseñas se guardan con hash SHA-256 + sal e iteraciones.
// Nota: al ser una app 100% en el navegador, esto es una capa de
// organización y disciplina, no seguridad fuerte: quien tenga acceso
// físico al dispositivo puede leer los datos en localStorage.
// ============================================================

// ---------- SHA-256 (implementación pura en JS, síncrona) ----------
// Se usa una implementación propia (y no crypto.subtle) para que
// funcione también en contextos no seguros (http:// en la red local)
// y de forma síncrona.

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

export function sha256(mensaje) {
  const msg = new TextEncoder().encode(mensaje);
  const l = msg.length;

  // Relleno: mensaje + 0x80 + ceros + longitud en bits (64 bits big-endian)
  const total = (((l + 8) >> 6) << 6) + 64;
  const bloque = new Uint8Array(total);
  bloque.set(msg);
  bloque[l] = 0x80;
  const dv = new DataView(bloque.buffer);
  const bitsAltos = Math.floor((l * 8) / 4294967296);
  dv.setUint32(total - 8, bitsAltos);
  dv.setUint32(total - 4, (l * 8) >>> 0);

  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);

  for (let i = 0; i < total; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H = [
      (H[0] + a) >>> 0, (H[1] + b) >>> 0, (H[2] + c) >>> 0, (H[3] + d) >>> 0,
      (H[4] + e) >>> 0, (H[5] + f) >>> 0, (H[6] + g) >>> 0, (H[7] + h) >>> 0,
    ];
  }
  return H.map((x) => x.toString(16).padStart(8, '0')).join('');
}

// ---------- Contraseñas ----------

const ITERACIONES = 500;

export function generarSal() {
  let bytes;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    bytes = crypto.getRandomValues(new Uint8Array(8));
  } else {
    bytes = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256));
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Devuelve el hash almacenable de una contraseña: "v1$iteraciones$sal$hash". */
export function hashContrasena(contrasena, sal = generarSal(), iteraciones = ITERACIONES) {
  let h = sha256(`${sal}|${contrasena}`);
  for (let i = 1; i < iteraciones; i++) h = sha256(h);
  return `v1$${iteraciones}$${sal}$${h}`;
}

export function verificarContrasena(contrasena, almacenado) {
  if (!almacenado) return false;
  const partes = almacenado.split('$');
  if (partes.length !== 4 || partes[0] !== 'v1') return false;
  const iteraciones = parseInt(partes[1], 10);
  const sal = partes[2];
  return hashContrasena(contrasena, sal, iteraciones) === almacenado;
}

// ---------- Usuarios y códigos ----------

export function normalizarUsuario(texto) {
  return (texto || '').trim().toLowerCase();
}

/** ¿Está libre este correo/usuario? (comparación sin mayúsculas/minúsculas) */
export function usuarioDisponible(state, correo, exceptoId = null) {
  const buscado = normalizarUsuario(correo);
  if (!buscado) return false;
  return !state.usuarios.some(
    (u) => u.id !== exceptoId && normalizarUsuario(u.correo) === buscado
  );
}

export function buscarPorCorreo(state, correo) {
  const buscado = normalizarUsuario(correo);
  return state.usuarios.find((u) => normalizarUsuario(u.correo) === buscado) || null;
}

/** Genera un usuario tipo nombre.apellido a partir del nombre completo, único en el estado. */
export function sugerirUsuario(state, nombre) {
  const base = (nombre || 'scout')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let candidato = base.length >= 2 ? `${base[0]}.${base[base.length - 1]}` : base[0] || 'scout';
  let sufijo = 1;
  let resultado = candidato;
  while (!usuarioDisponible(state, resultado)) {
    sufijo += 1;
    resultado = `${candidato}${sufijo}`;
  }
  return resultado;
}

// Alfabeto sin caracteres ambiguos (sin 0/O, 1/I/L)
const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generarCodigo(largo = 6) {
  let codigo = '';
  for (let i = 0; i < largo; i++) {
    codigo += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return codigo;
}

/**
 * Busca a qué tropa y rol corresponde un código de invitación.
 * Devuelve { tropa, rol: 'scout'|'jefe' } o null.
 */
export function resolverCodigo(state, codigo) {
  const buscado = (codigo || '').trim().toUpperCase();
  if (!buscado) return null;
  for (const t of state.tropas) {
    if (t.codigoScout === buscado) return { tropa: t, rol: 'scout' };
    if (t.codigoDirigente === buscado) return { tropa: t, rol: 'jefe' };
  }
  return null;
}

export const CONTRASENA_DEMO = 'demo123';
