import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabase, CONFIGURADO, correoAuth, clienteTemporal } from './supabase.js';
import { reducer, uid } from './reducer.js';

export { uid };

const AppContext = createContext(null);

// ---------- Utilidades ----------

function traducirError(mensaje) {
  const m = (mensaje || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'Usuario o contraseña incorrectos.';
  if (m.includes('user already registered')) return 'Ya existe una cuenta con ese usuario.';
  if (m.includes('password should be at least')) return 'La contraseña es demasiado corta (mínimo 6 caracteres).';
  if (m.includes('failed to fetch')) return 'No hay conexión con el servidor. Revisa tu internet.';
  return mensaje;
}

function fallar(error) {
  if (error) throw new Error(traducirError(error.message));
}

const COLS_TRABAJO = [
  'id', 'scoutId', 'territorioId', 'nivel', 'estado', 'plan', 'avances', 'revisiones',
  'creado', 'actualizado', 'enviadoEn', 'conquistadoEn',
];
const COLS_PATRULLA = ['id', 'tropaId', 'nombre', 'emblema', 'color'];
const COLS_TROPA = ['id', 'nombre', 'grupo'];
const COLS_PERFIL = ['nombre', 'correo', 'avatar', 'patrullaId', 'rol', 'tropaId'];

function tomar(objeto, columnas) {
  const res = {};
  for (const c of columnas) if (c in objeto) res[c] = objeto[c] ?? null;
  return res;
}

function diferencias(antes, despues) {
  const previos = new Map(antes.map((x) => [x.id, x]));
  const nuevos = [];
  const cambiados = [];
  for (const item of despues) {
    const previo = previos.get(item.id);
    if (!previo) nuevos.push(item);
    else if (JSON.stringify(previo) !== JSON.stringify(item)) cambiados.push(item);
    previos.delete(item.id);
  }
  return { nuevos, cambiados, eliminados: [...previos.values()] };
}

async function cargarTodo() {
  const [tropasR, codigosR, patrullasR, perfilesR, trabajosR] = await Promise.all([
    supabase.from('tropas').select('*'),
    supabase.from('codigos').select('*'),
    supabase.from('patrullas').select('*'),
    supabase.from('perfiles').select('*'),
    supabase.from('trabajos').select('*'),
  ]);
  fallar(tropasR.error);
  fallar(patrullasR.error);
  fallar(perfilesR.error);
  fallar(trabajosR.error);
  const codigos = codigosR.data || []; // los scouts no ven códigos (RLS): lista vacía
  const tropas = (tropasR.data || []).map((t) => ({
    ...t,
    codigoScout: codigos.find((c) => c.tropaId === t.id && c.rol === 'scout')?.codigo,
    codigoDirigente: codigos.find((c) => c.tropaId === t.id && c.rol === 'jefe')?.codigo,
  }));
  return {
    version: 2,
    demo: false,
    tropas,
    patrullas: patrullasR.data || [],
    usuarios: perfilesR.data || [],
    trabajos: trabajosR.data || [],
  };
}

/** Persiste en Supabase la diferencia entre dos estados (acciones genéricas). */
async function persistir(viejo, nuevo) {
  // Trabajos
  const dt = diferencias(viejo.trabajos, nuevo.trabajos);
  for (const t of dt.nuevos) fallar((await supabase.from('trabajos').insert(tomar(t, COLS_TRABAJO))).error);
  for (const t of dt.cambiados) fallar((await supabase.from('trabajos').update(tomar(t, COLS_TRABAJO)).eq('id', t.id)).error);
  for (const t of dt.eliminados) fallar((await supabase.from('trabajos').delete().eq('id', t.id)).error);

  // Patrullas
  const dp = diferencias(viejo.patrullas, nuevo.patrullas);
  for (const p of dp.nuevos) fallar((await supabase.from('patrullas').insert(tomar(p, COLS_PATRULLA))).error);
  for (const p of dp.cambiados) fallar((await supabase.from('patrullas').update(tomar(p, COLS_PATRULLA)).eq('id', p.id)).error);
  for (const p of dp.eliminados) fallar((await supabase.from('patrullas').delete().eq('id', p.id)).error);

  // Tropas (los códigos viven en su propia tabla)
  const dr = diferencias(viejo.tropas, nuevo.tropas);
  for (const t of dr.nuevos) {
    fallar((await supabase.from('tropas').insert(tomar(t, COLS_TROPA))).error);
    if (t.codigoScout)
      fallar((await supabase.from('codigos').insert({ codigo: t.codigoScout, tropaId: t.id, rol: 'scout' })).error);
    if (t.codigoDirigente)
      fallar((await supabase.from('codigos').insert({ codigo: t.codigoDirigente, tropaId: t.id, rol: 'jefe' })).error);
  }
  for (const t of dr.cambiados) {
    const previo = viejo.tropas.find((x) => x.id === t.id);
    const base = tomar(t, COLS_TROPA);
    if (JSON.stringify(base) !== JSON.stringify(tomar(previo, COLS_TROPA)))
      fallar((await supabase.from('tropas').update(base).eq('id', t.id)).error);
    if (previo.codigoScout !== t.codigoScout && t.codigoScout)
      fallar((await supabase.from('codigos').update({ codigo: t.codigoScout }).eq('codigo', previo.codigoScout)).error);
    if (previo.codigoDirigente !== t.codigoDirigente && t.codigoDirigente)
      fallar((await supabase.from('codigos').update({ codigo: t.codigoDirigente }).eq('codigo', previo.codigoDirigente)).error);
  }
  // La eliminación de tropas va por la función eliminar_tropa (no por aquí).

  // Perfiles (solo ediciones)
  const du = diferencias(viejo.usuarios, nuevo.usuarios);
  for (const u of du.cambiados) fallar((await supabase.from('perfiles').update(tomar(u, COLS_PERFIL)).eq('id', u.id)).error);
}

// ---------- Proveedor ----------

export function AppProvider({ children }) {
  const [sesion, setSesion] = useState(undefined); // undefined = aún no se sabe
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const estadoRef = useRef(null);
  estadoRef.current = estado;
  const recargaTimer = useRef(null);

  const usuarioId = sesion?.user?.id || null;

  // Sesión de Supabase Auth
  useEffect(() => {
    if (!CONFIGURADO) {
      setCargando(false);
      setSesion(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const recargar = useCallback(async () => {
    if (!supabase) return;
    try {
      const datos = await cargarTodo();
      setEstado(datos);
      // Sesión sin perfil (registro a medias): cerrar para volver a empezar.
      const uidSesion = (await supabase.auth.getSession()).data.session?.user?.id;
      if (uidSesion && !datos.usuarios.some((u) => u.id === uidSesion)) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('No se pudo cargar el estado:', e);
    }
  }, []);

  // Cargar datos al iniciar sesión
  useEffect(() => {
    if (sesion === undefined) return;
    if (!sesion) {
      setEstado(null);
      setCargando(false);
      return;
    }
    setCargando(true);
    recargar().finally(() => setCargando(false));
  }, [usuarioId, sesion === undefined]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tiempo real: ante cualquier cambio en las tablas, recargar (con freno)
  useEffect(() => {
    if (!usuarioId || !supabase) return;
    const programar = () => {
      clearTimeout(recargaTimer.current);
      recargaTimer.current = setTimeout(recargar, 700);
    };
    const canal = supabase
      .channel('cambios-diario')
      .on('postgres_changes', { event: '*', schema: 'public' }, programar)
      .subscribe();
    const alVolver = () => document.visibilityState === 'visible' && programar();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      supabase.removeChannel(canal);
      document.removeEventListener('visibilitychange', alVolver);
      clearTimeout(recargaTimer.current);
    };
  }, [usuarioId, recargar]);

  // ---------- Acciones ----------

  const crearCuenta = useCallback(async (u) => {
    const temporal = clienteTemporal();
    const { data, error } = await temporal.auth.signUp({
      email: correoAuth(u.correo),
      password: u.contrasena,
    });
    fallar(error);
    const { error: e2 } = await supabase.rpc('asignar_perfil', {
      p_id: data.user.id,
      p_nombre: u.nombre,
      p_correo: u.correo.trim(),
      p_rol: u.rol || 'scout',
      p_tropa: u.tropaId || null,
      p_patrulla: u.patrullaId || null,
      p_avatar: u.avatar || null,
    });
    fallar(e2);
  }, []);

  const dispatch = useCallback(
    async (accion) => {
      const previo = estadoRef.current;
      try {
        switch (accion.type) {
          case 'usuario/crear':
            await crearCuenta(accion.usuario);
            await recargar();
            return;
          case 'usuario/eliminar':
            fallar((await supabase.rpc('eliminar_usuario', { p_id: accion.usuarioId })).error);
            await recargar();
            return;
          case 'tropa/eliminar':
            fallar((await supabase.rpc('eliminar_tropa', { p_tropa: accion.tropaId })).error);
            await recargar();
            return;
          case 'usuario/editar': {
            const { contrasena, ...cambios } = accion.cambios;
            if (contrasena) {
              if (accion.usuarioId === usuarioId) {
                fallar((await supabase.auth.updateUser({ password: contrasena })).error);
              } else {
                fallar(
                  (await supabase.rpc('restablecer_contrasena', { p_id: accion.usuarioId, p_nueva: contrasena })).error
                );
              }
            }
            if (Object.keys(cambios).length > 0) {
              const nuevo = reducer(previo, { ...accion, cambios });
              setEstado(nuevo);
              await persistir(previo, nuevo);
            }
            return;
          }
          default: {
            const nuevo = reducer(previo, accion);
            setEstado(nuevo);
            await persistir(previo, nuevo);
          }
        }
      } catch (e) {
        alert(e.message);
        recargar();
      }
    },
    [usuarioId, crearCuenta, recargar]
  );

  // ---------- Autenticación ----------

  const ingresar = useCallback(async (correo, contrasena) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: correoAuth(correo),
      password: contrasena,
    });
    fallar(error);
  }, []);

  const registrarse = useCallback(async ({ codigo, nombre, correo, contrasena }) => {
    const disponible = await supabase.rpc('correo_disponible', { p_correo: correo });
    fallar(disponible.error);
    if (!disponible.data) throw new Error('Ese correo o usuario ya está en uso.');
    const { data, error } = await supabase.auth.signUp({
      email: correoAuth(correo),
      password: contrasena,
    });
    fallar(error);
    if (!data.session) {
      throw new Error(
        'El proyecto de Supabase tiene activada la confirmación por correo. Desactívala en Authentication → Sign In / Up → Email.'
      );
    }
    const { error: e2 } = await supabase.rpc('registrar_con_codigo', {
      p_codigo: codigo,
      p_nombre: nombre,
      p_correo: correo.trim(),
    });
    if (e2) {
      await supabase.auth.signOut();
      throw new Error(traducirError(e2.message));
    }
  }, []);

  const configuracionInicial = useCallback(async ({ nombre, correo, contrasena }) => {
    const { data, error } = await supabase.auth.signUp({
      email: correoAuth(correo),
      password: contrasena,
    });
    fallar(error);
    if (!data.session) {
      throw new Error(
        'El proyecto de Supabase tiene activada la confirmación por correo. Desactívala en Authentication → Sign In / Up → Email.'
      );
    }
    const { error: e2 } = await supabase.rpc('configuracion_inicial', {
      p_nombre: nombre,
      p_correo: correo.trim(),
    });
    if (e2) {
      await supabase.auth.signOut();
      throw new Error(traducirError(e2.message));
    }
  }, []);

  const validarCodigo = useCallback(async (codigo) => {
    if (!codigo?.trim()) return null;
    const { data, error } = await supabase.rpc('validar_codigo', { p_codigo: codigo });
    if (error || !data || data.length === 0) return null;
    return { tropaNombre: data[0].tropa_nombre, rol: data[0].rol };
  }, []);

  const hayUsuarios = useCallback(async () => {
    const { data, error } = await supabase.rpc('hay_usuarios');
    if (error) throw new Error(traducirError(error.message));
    return Boolean(data);
  }, []);

  const cambiarMiContrasena = useCallback(
    async (actual, nueva) => {
      const correo = sesion?.user?.email;
      const prueba = await supabase.auth.signInWithPassword({ email: correo, password: actual });
      if (prueba.error) throw new Error('La contraseña actual no es correcta.');
      fallar((await supabase.auth.updateUser({ password: nueva })).error);
    },
    [sesion]
  );

  const salir = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const usuario = useMemo(
    () => (estado && usuarioId ? estado.usuarios.find((u) => u.id === usuarioId) || null : null),
    [estado, usuarioId]
  );

  const valor = useMemo(
    () => ({
      configurado: CONFIGURADO,
      state: estado,
      dispatch,
      usuario,
      cargando: cargando || sesion === undefined,
      ingresar,
      registrarse,
      configuracionInicial,
      validarCodigo,
      hayUsuarios,
      cambiarMiContrasena,
      salir,
      recargar,
    }),
    [estado, dispatch, usuario, cargando, sesion, ingresar, registrarse, configuracionInicial, validarCodigo, hayUsuarios, cambiarMiContrasena, salir, recargar]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
