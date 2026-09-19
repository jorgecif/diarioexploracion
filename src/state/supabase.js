import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** ¿Está configurada la conexión a Supabase? (.env.local) */
export const CONFIGURADO = Boolean(url && clave);

export const supabase = CONFIGURADO ? createClient(url, clave) : null;

/**
 * Los scouts entran con un "usuario" corto (ej: mateo.gomez). Supabase Auth
 * exige formato de correo, así que a los usuarios sin @ se les agrega un
 * dominio interno. Si la persona escribe un correo real, se usa tal cual.
 */
export function correoAuth(usuario) {
  const u = (usuario || '').trim().toLowerCase();
  return u.includes('@') ? u : `${u}@scouts.local`;
}

/** Cliente temporal para crear cuentas sin perder la sesión actual (jefes/admin). */
export function clienteTemporal() {
  return createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
