export const AVATARES_SCOUT = ['🦊', '🐢', '🦉', '🐺', '🦁', '🦋', '🐍', '🦌', '🐯', '🦅', '🐆', '🦫', '🐗', '🦔', '🐿️', '🦜'];
export const AVATARES_JEFE = ['🧭', '🎒', '🪢', '🏕️', '🔦', '🗺️'];
export const AVATARES_ADMIN = ['🛡️', '⚙️', '🗄️', '🧑‍💻'];
export const EMBLEMAS_PATRULLA = ['🦅', '🐆', '🐺', '🦁', '🐍', '🦉', '🦌', '🐯', '🦈', '🐃', '🦂', '🐎'];

export function avataresPorRol(rol) {
  if (rol === 'admin') return AVATARES_ADMIN;
  if (rol === 'jefe') return AVATARES_JEFE;
  return AVATARES_SCOUT;
}

export function avatarPorDefecto(rol) {
  return avataresPorRol(rol)[0];
}
