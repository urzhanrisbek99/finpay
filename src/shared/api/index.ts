// Публичный API слоя (клиентская часть). Серверный клиент импортируется
// напрямую из "#shared/api/supabase/server", т.к. помечен server-only: через
// этот баррель он утянул бы next/headers в клиентский бандл.
export { createBrowserClient } from "./supabase/client";
