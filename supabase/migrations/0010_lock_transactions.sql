-- Журнал транзакций доступен клиенту только на чтение.
--
-- 0006 закрыл прямую запись баланса, но таблицу transactions не трогал: если
-- она заводилась через Dashboard, у authenticated остались insert/update/delete
-- по умолчанию. Баланс этим не подделать (его двигают только RPC), а вот
-- журнал — да, и через него уже месячный лимит карты:
--
--   * current_month_spent суммирует расходные строки текущего месяца, поэтому
--     `delete from transactions` из devtools обнуляет счётчик лимита;
--   * `update ... set status = 'failed'` даёт то же самое — failed из суммы
--     исключается;
--   * произвольный insert рисует фальшивую историю доходов и ломает статистику.
--
-- Писать в журнал должны только security definer функции (transfer_money /
-- add_income / create_qr_payment / confirm_qr_payment): они выполняются от
-- владельца, и отзыв грантов у вызывающего им не мешает.
--
-- Выполнить в SQL Editor целиком.

revoke insert, update, delete on public.transactions from anon, authenticated;
grant select on public.transactions to authenticated;

-- Политик на запись быть не должно: без грантов они и так мертвы, но лишняя
-- политика создаёт впечатление, что запись разрешена.
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;
