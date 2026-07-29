revoke insert, update, delete on public.transactions from anon, authenticated;
grant select on public.transactions to authenticated;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;
