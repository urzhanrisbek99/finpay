create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(u.email, ''), '@', 1)
  )
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

revoke insert on public.profiles from anon, authenticated;
drop policy if exists "profiles_insert_own" on public.profiles;

alter table public.cards
  add constraint cards_one_per_user unique (user_id);

alter table public.cards
  alter column spending_limit drop default;

alter table public.cards
  add constraint cards_spending_limit_positive check (spending_limit > 0);
