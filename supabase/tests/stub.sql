create schema if not exists auth;
create schema if not exists extensions;
create schema if not exists vault;

create extension if not exists pgcrypto with schema extensions;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

create table if not exists auth.users (
  id uuid primary key default extensions.gen_random_uuid(),
  email text
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create table if not exists vault.secrets (
  id uuid primary key default extensions.gen_random_uuid(),
  name text unique,
  secret text,
  description text
);

create or replace view vault.decrypted_secrets as
  select id, name, secret as decrypted_secret, description from vault.secrets;

create or replace function vault.create_secret(
  new_secret text,
  new_name text default null,
  new_description text default ''
)
returns uuid
language plpgsql
as $$
declare
  v_id uuid;
begin
  insert into vault.secrets (name, secret, description)
  values (new_name, new_secret, new_description)
  returning id into v_id;
  return v_id;
end;
$$;

grant usage on schema auth, extensions, vault, public to anon, authenticated;
