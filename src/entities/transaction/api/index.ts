import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "#shared/api/supabase/client";
import type { Transaction } from "../model/types";

export const transactionApi = {
  // Читаем и с клиента, и из SSR (передаётся серверный клиент из layout).
  // Запись транзакций идёт через серверные RPC в features, не здесь.
  getAll: async (
    userId: string,
    client?: SupabaseClient,
  ): Promise<{ data: Transaction[] | null; error: string | null }> => {
    const supabase = client ?? createBrowserClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return {
      data: data as Transaction[] | null,
      error: error ? error.message : null,
    };
  },
};
