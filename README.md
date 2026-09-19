# ⚜️ Diario de Exploración — Progresión Scout

Aplicación web para el seguimiento de la **progresión personal de la Rama Scout** (Asociación
Scouts de Colombia), basada en el esquema de **Rutas y Territorios**:

- **6 Rutas de crecimiento**: Temple, Ingenio, Forja, Lazos, Patrulla y Horizonte, con sus
  22 territorios (competencias intermedias de la Tabla 8.5) y sus parches oficiales.
- **3 niveles por ruta**: Descubro (mostaza), Construyo (turquesa) y Conquisto (naranja).
  Una ruta alcanza un nivel al conquistar **2 territorios** de esa ruta en ese nivel.
- **4 insignias** (Tabla 8.7): Vigía del Valle, Explorador de Cumbres, Navegante de
  Horizontes y Maestro de la Aventura.
- **Rol del dirigente** según el nivel: Apoyo, Acompañamiento y Enlace.

Frontend en React + Vite. Backend en **Supabase** (Postgres + autenticación), con
sincronización en tiempo real entre los dispositivos de toda la tropa.

## Qué puede hacer cada quien

**Scouts** 🧑‍🚀
- Conocer cómo funciona la progresión (pestaña *Aprende*).
- Explorar rutas y territorios con tarjetas de ejemplos de conquista por nivel.
- Iniciar conquistas, escribir su **plan de conquista** (con dictado por voz 🎙️) según lo
  conversado con su dirigente, y registrar avances en su diario.
- Enviar conquistas a revisión, recibir realimentación y ver su progresión e insignias.
- Ver el avance de su patrulla y sus compañeros.

**Dirigentes** 🧭
- Gestionar la tropa: patrullas, scouts (asignación a patrullas) y cuentas.
- Compartir los códigos de invitación para que cada quien cree su cuenta.
- Planear territorios junto al scout y marcar planes como acordados.
- Revisar conquistas enviadas: aprobar o pedir ajustes con comentarios (también por voz).
- Ver el avance individual, por patrulla y de toda la tropa.

**Administrador** 🛡️
- Crear y gestionar varias tropas (cada una con sus códigos de invitación).
- Gestionar todas las cuentas: roles, tropas, restablecer contraseñas.

## Configurar el backend (una sola vez)

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) y un **proyecto nuevo**
   (elige una región cercana, p. ej. São Paulo).
2. En el proyecto: **SQL Editor → New query**, pega todo el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo (**Run**).
3. En **Authentication → Sign In / Up → Email**: desactiva **Confirm email**
   (los scouts entran con un usuario corto, no con correo real).
4. En **Settings → API** copia la *Project URL* y la clave *anon public*.
5. Copia `.env.local.example` como `.env.local` y pega esos dos valores.

## Ejecutar

```bash
npm install
npm run dev        # desarrollo → http://localhost:5199
npm run build      # producción → carpeta dist/
```

La primera vez, la app pide crear la cuenta de **administrador**. Con ella crea una tropa,
comparte sus códigos de invitación, y dirigentes y scouts se registran solos desde sus
celulares.

## Publicar

Sube la carpeta `dist/` a cualquier hosting estático (Netlify, Vercel, Cloudflare Pages…).
Si el build lo hace el hosting, configura allí las variables `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY`.

## Notas

- Los scouts pueden ingresar con un usuario corto (`mateo.gomez`); internamente se registra
  como `mateo.gomez@scouts.local` en Supabase Auth. También sirven correos reales.
- ¿Contraseña olvidada? El dirigente o el admin asignan una nueva desde Gestión/Usuarios →
  Editar.
- La seguridad se aplica en la base de datos (políticas RLS): cada scout solo escribe sus
  propias conquistas, los dirigentes las de su tropa y el admin todo; un scout no puede
  aprobarse conquistas a sí mismo.
- El dictado por voz usa la Web Speech API del navegador (Chrome/Edge, requiere micrófono).

## Estructura

```
supabase/schema.sql    ← esquema de la base de datos, RLS y funciones (ejecutar en Supabase)
src/
  data/progresion.js   ← rutas, territorios, niveles, insignias, ejemplos (contenido oficial)
  state/supabase.js    ← conexión a Supabase (.env.local)
  state/store.jsx      ← sesión, carga de datos, acciones y tiempo real
  state/reducer.js     ← lógica pura de las acciones
  state/logica.js      ← cálculo de niveles por ruta e insignias
  views/               ← vistas de scout, dirigente, admin y compartidas
  components/          ← componentes comunes (dictado por voz, parches, modales…)
public/insignias/      ← parches oficiales (rutas × niveles y fases)
public/marca/          ← logos (Scouts de Colombia, Rama Scout, El Gran Juego)
```
