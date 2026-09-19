import { createContext, useContext } from 'react';

// Navegación sencilla por vistas: { v: 'inicio', ...parametros }
export const NavContext = createContext(null);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav debe usarse dentro del proveedor de navegación');
  return ctx; // { vista, navegar }
}

// Sesión: usuario actual + salir()
export const SesionContext = createContext(null);

export function useSesion() {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error('useSesion debe usarse dentro del proveedor de sesión');
  return ctx; // { usuario, salir }
}
