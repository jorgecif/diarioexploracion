-- ============================================================
-- Diario de Exploración · Esquema de Supabase
-- Ejecutar completo en: Supabase Dashboard → SQL Editor → New query
-- (Es idempotente: se puede volver a ejecutar sin problema)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Tablas ----------

create table if not exists public.tropas (
  id text primary key default ('tropa-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  nombre text not null,
  grupo text not null default '',
  creada timestamptz not null default now()
);

create table if not exists public.codigos (
  codigo text primary key,
  "tropaId" text not null references public.tropas(id) on delete cascade,
  rol text not null check (rol in ('scout', 'jefe'))
);

create table if not exists public.patrullas (
  id text primary key default ('pat-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  "tropaId" text not null references public.tropas(id) on delete cascade,
  nombre text not null,
  emblema text not null default '🐾',
  color text not null default '#2c6e31'
);

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  correo text not null unique,
  rol text not null check (rol in ('admin', 'jefe', 'scout')),
  "tropaId" text references public.tropas(id) on delete cascade,
  "patrullaId" text references public.patrullas(id) on delete set null,
  avatar text not null default '🦊',
  creado timestamptz not null default now()
);

create table if not exists public.trabajos (
  id text primary key,
  "scoutId" uuid not null references public.perfiles(id) on delete cascade,
  "territorioId" text not null,
  nivel text not null check (nivel in ('descubro', 'construyo', 'conquisto')),
  estado text not null default 'planeando'
    check (estado in ('planeando', 'en_progreso', 'en_revision', 'conquistado')),
  plan jsonb not null default '{"texto":"","acordado":null,"actualizado":null}'::jsonb,
  avances jsonb not null default '[]'::jsonb,
  revisiones jsonb not null default '[]'::jsonb,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  "enviadoEn" timestamptz,
  "conquistadoEn" timestamptz
);

-- ---------- Funciones auxiliares (evitan recursión en las políticas) ----------

create or replace function public.mi_rol()
returns text language sql stable security definer set search_path = public as
$$ select rol from public.perfiles where id = auth.uid() $$;

create or replace function public.mi_tropa()
returns text language sql stable security definer set search_path = public as
$$ select "tropaId" from public.perfiles where id = auth.uid() $$;

-- ---------- Funciones públicas (pantalla de ingreso) ----------

-- ¿Ya hay alguna cuenta creada? (para mostrar la configuración inicial)
create or replace function public.hay_usuarios()
returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.perfiles) $$;

-- Valida un código de invitación y dice a qué tropa/rol corresponde.
create or replace function public.validar_codigo(p_codigo text)
returns table(tropa_nombre text, rol text)
language sql stable security definer set search_path = public as
$$
  select t.nombre, c.rol
  from public.codigos c join public.tropas t on t.id = c."tropaId"
  where upper(c.codigo) = upper(trim(p_codigo))
$$;

-- ¿Está libre este correo/usuario?
create or replace function public.correo_disponible(p_correo text)
returns boolean language sql stable security definer set search_path = public as
$$ select not exists(select 1 from public.perfiles where lower(correo) = lower(trim(p_correo))) $$;

grant execute on function public.hay_usuarios(), public.validar_codigo(text), public.correo_disponible(text) to anon, authenticated;

-- ---------- Funciones de cuenta ----------

-- Crea el perfil del PRIMER administrador (solo si no existe nadie).
create or replace function public.configuracion_inicial(p_nombre text, p_correo text)
returns void language plpgsql security definer set search_path = public as
$$
begin
  if exists(select 1 from public.perfiles) then
    raise exception 'La aplicación ya está configurada.';
  end if;
  insert into public.perfiles (id, nombre, correo, rol, avatar)
  values (auth.uid(), trim(p_nombre), trim(p_correo), 'admin', '🛡️');
end
$$;

-- Registro con código de invitación (crea el perfil del usuario recién autenticado).
create or replace function public.registrar_con_codigo(p_codigo text, p_nombre text, p_correo text)
returns void language plpgsql security definer set search_path = public as
$$
declare v record;
begin
  select c."tropaId" as tropa, c.rol into v
  from public.codigos c where upper(c.codigo) = upper(trim(p_codigo));
  if not found then
    raise exception 'El código de invitación no es válido.';
  end if;
  if exists(select 1 from public.perfiles where lower(correo) = lower(trim(p_correo))) then
    raise exception 'Ese correo o usuario ya está en uso.';
  end if;
  if exists(select 1 from public.perfiles where id = auth.uid()) then
    raise exception 'Esta cuenta ya tiene un perfil.';
  end if;
  insert into public.perfiles (id, nombre, correo, rol, "tropaId", avatar)
  values (auth.uid(), trim(p_nombre), trim(p_correo), v.rol, v.tropa,
          case when v.rol = 'jefe' then '🧭' else '🦊' end);
end
$$;

-- Un dirigente/admin crea el perfil de una cuenta que acaba de registrar.
create or replace function public.asignar_perfil(
  p_id uuid, p_nombre text, p_correo text, p_rol text, p_tropa text, p_patrulla text, p_avatar text
) returns void language plpgsql security definer set search_path = public as
$$
begin
  if public.mi_rol() = 'jefe' then
    if p_rol not in ('scout', 'jefe') or p_tropa is distinct from public.mi_tropa() then
      raise exception 'No autorizado.';
    end if;
  elsif public.mi_rol() <> 'admin' then
    raise exception 'No autorizado.';
  end if;
  if exists(select 1 from public.perfiles where lower(correo) = lower(trim(p_correo))) then
    raise exception 'Ese correo o usuario ya está en uso.';
  end if;
  insert into public.perfiles (id, nombre, correo, rol, "tropaId", "patrullaId", avatar)
  values (p_id, trim(p_nombre), trim(p_correo), p_rol,
          case when p_rol = 'admin' then null else p_tropa end,
          nullif(p_patrulla, ''), coalesce(p_avatar, '🦊'));
end
$$;

-- Restablecer la contraseña de otro usuario (dirigente de su tropa o admin).
create or replace function public.restablecer_contrasena(p_id uuid, p_nueva text)
returns void language plpgsql security definer set search_path = public, extensions as
$$
declare v_rol text; v_tropa text;
begin
  select rol, "tropaId" into v_rol, v_tropa from public.perfiles where id = p_id;
  if not found then raise exception 'Usuario no encontrado.'; end if;
  if length(p_nueva) < 4 then raise exception 'La contraseña debe tener al menos 4 caracteres.'; end if;
  if public.mi_rol() = 'admin' then null;
  elsif public.mi_rol() = 'jefe' and v_tropa = public.mi_tropa() and v_rol <> 'admin' then null;
  else raise exception 'No autorizado.';
  end if;
  update auth.users set encrypted_password = crypt(p_nueva, gen_salt('bf')) where id = p_id;
end
$$;

-- Eliminar la cuenta de un usuario (borra también su acceso).
create or replace function public.eliminar_usuario(p_id uuid)
returns void language plpgsql security definer set search_path = public as
$$
declare v_rol text; v_tropa text;
begin
  select rol, "tropaId" into v_rol, v_tropa from public.perfiles where id = p_id;
  if not found then raise exception 'Usuario no encontrado.'; end if;
  if p_id = auth.uid() then raise exception 'No puedes eliminar tu propia cuenta.'; end if;
  if v_rol = 'admin' then
    if public.mi_rol() <> 'admin' then raise exception 'No autorizado.'; end if;
    if (select count(*) from public.perfiles where rol = 'admin') <= 1 then
      raise exception 'No se puede eliminar al último administrador.';
    end if;
  elsif public.mi_rol() = 'jefe' and v_tropa = public.mi_tropa() then null;
  elsif public.mi_rol() <> 'admin' then raise exception 'No autorizado.';
  end if;
  delete from auth.users where id = p_id;
end
$$;

-- Eliminar una tropa completa (incluye las cuentas de sus miembros).
create or replace function public.eliminar_tropa(p_tropa text)
returns void language plpgsql security definer set search_path = public as
$$
begin
  if public.mi_rol() <> 'admin' then raise exception 'No autorizado.'; end if;
  delete from auth.users where id in (select id from public.perfiles where "tropaId" = p_tropa);
  delete from public.tropas where id = p_tropa;
end
$$;

grant execute on function
  public.configuracion_inicial(text, text),
  public.registrar_con_codigo(text, text, text),
  public.asignar_perfil(uuid, text, text, text, text, text, text),
  public.restablecer_contrasena(uuid, text),
  public.eliminar_usuario(uuid),
  public.eliminar_tropa(text)
to authenticated;

-- ---------- Seguridad por filas (RLS) ----------

alter table public.tropas enable row level security;
alter table public.codigos enable row level security;
alter table public.patrullas enable row level security;
alter table public.perfiles enable row level security;
alter table public.trabajos enable row level security;

-- Tropas: los miembros ven la suya; el admin todas. Escriben jefes (la suya) y admin.
drop policy if exists tropas_select on public.tropas;
create policy tropas_select on public.tropas for select using (
  public.mi_rol() = 'admin' or id = public.mi_tropa()
);
drop policy if exists tropas_insert on public.tropas;
create policy tropas_insert on public.tropas for insert with check (public.mi_rol() = 'admin');
drop policy if exists tropas_update on public.tropas;
create policy tropas_update on public.tropas for update using (
  public.mi_rol() = 'admin' or (public.mi_rol() = 'jefe' and id = public.mi_tropa())
);
drop policy if exists tropas_delete on public.tropas;
create policy tropas_delete on public.tropas for delete using (public.mi_rol() = 'admin');

-- Códigos: solo jefes (su tropa) y admin pueden verlos y cambiarlos.
drop policy if exists codigos_all on public.codigos;
create policy codigos_all on public.codigos for all using (
  public.mi_rol() = 'admin' or (public.mi_rol() = 'jefe' and "tropaId" = public.mi_tropa())
) with check (
  public.mi_rol() = 'admin' or (public.mi_rol() = 'jefe' and "tropaId" = public.mi_tropa())
);

-- Patrullas: las ve toda la tropa; las escriben jefes de la tropa y admin.
drop policy if exists patrullas_select on public.patrullas;
create policy patrullas_select on public.patrullas for select using (
  public.mi_rol() = 'admin' or "tropaId" = public.mi_tropa()
);
drop policy if exists patrullas_write on public.patrullas;
create policy patrullas_write on public.patrullas for all using (
  public.mi_rol() = 'admin' or (public.mi_rol() = 'jefe' and "tropaId" = public.mi_tropa())
) with check (
  public.mi_rol() = 'admin' or (public.mi_rol() = 'jefe' and "tropaId" = public.mi_tropa())
);

-- Perfiles: se ven dentro de la misma tropa (y el propio); el admin ve todos.
-- Los inserta solo el sistema (funciones definer). Actualiza: uno mismo,
-- el jefe de la tropa (no a admins) o el admin.
drop policy if exists perfiles_select on public.perfiles;
create policy perfiles_select on public.perfiles for select using (
  public.mi_rol() = 'admin'
  or id = auth.uid()
  or ("tropaId" is not null and "tropaId" = public.mi_tropa())
);
drop policy if exists perfiles_update on public.perfiles;
create policy perfiles_update on public.perfiles for update using (
  public.mi_rol() = 'admin'
  or id = auth.uid()
  or (public.mi_rol() = 'jefe' and "tropaId" = public.mi_tropa() and rol <> 'admin')
);

-- Guardia de perfiles: nadie que no sea admin cambia roles ni tropas;
-- un scout solo se cambia nombre/correo/avatar a sí mismo.
create or replace function public.perfiles_guardia()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  if public.mi_rol() = 'admin' then return new; end if;
  if new.rol is distinct from old.rol then
    raise exception 'No puedes cambiar el rol de una cuenta.';
  end if;
  if new."tropaId" is distinct from old."tropaId" then
    raise exception 'No puedes cambiar la tropa de una cuenta.';
  end if;
  if public.mi_rol() = 'scout' and new."patrullaId" is distinct from old."patrullaId" then
    raise exception 'Solo tu dirigente puede cambiarte de patrulla.';
  end if;
  return new;
end
$$;
drop trigger if exists perfiles_guardia_tg on public.perfiles;
create trigger perfiles_guardia_tg before update on public.perfiles
for each row execute function public.perfiles_guardia();

-- Trabajos: los ve toda la tropa del scout; los escribe el scout dueño,
-- los jefes de su tropa y el admin.
create or replace function public.tropa_de_scout(p_scout uuid)
returns text language sql stable security definer set search_path = public as
$$ select "tropaId" from public.perfiles where id = p_scout $$;

drop policy if exists trabajos_select on public.trabajos;
create policy trabajos_select on public.trabajos for select using (
  public.mi_rol() = 'admin' or public.tropa_de_scout("scoutId") = public.mi_tropa()
);
drop policy if exists trabajos_write on public.trabajos;
create policy trabajos_write on public.trabajos for all using (
  public.mi_rol() = 'admin'
  or "scoutId" = auth.uid()
  or (public.mi_rol() = 'jefe' and public.tropa_de_scout("scoutId") = public.mi_tropa())
) with check (
  public.mi_rol() = 'admin'
  or "scoutId" = auth.uid()
  or (public.mi_rol() = 'jefe' and public.tropa_de_scout("scoutId") = public.mi_tropa())
);

-- Guardia de trabajos: un scout no puede aprobarse a sí mismo.
create or replace function public.trabajos_guardia()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  if public.mi_rol() <> 'scout' then return new; end if;
  if tg_op = 'INSERT' then
    if new.estado not in ('planeando', 'en_progreso') or new.revisiones <> '[]'::jsonb then
      raise exception 'Operación no permitida.';
    end if;
    return new;
  end if;
  if new.revisiones is distinct from old.revisiones then
    raise exception 'Solo tu dirigente puede registrar revisiones.';
  end if;
  if new.estado = 'conquistado' and old.estado <> 'conquistado' then
    raise exception 'Solo tu dirigente puede aprobar una conquista.';
  end if;
  if (new.plan -> 'acordado') is distinct from (old.plan -> 'acordado') then
    raise exception 'Solo tu dirigente puede marcar el plan como acordado.';
  end if;
  return new;
end
$$;
drop trigger if exists trabajos_guardia_tg on public.trabajos;
create trigger trabajos_guardia_tg before insert or update on public.trabajos
for each row execute function public.trabajos_guardia();

-- ---------- Tiempo real ----------
do $$
begin
  begin alter publication supabase_realtime add table public.tropas; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.codigos; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.patrullas; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.perfiles; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.trabajos; exception when duplicate_object then null; end;
end $$;
