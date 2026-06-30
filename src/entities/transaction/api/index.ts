import { createBrowserClient } from "@/src/shared/api/supabase/client";
import type { Transaction } from "../model/types";

export const transactionApi = {
  // получить все транзакции пользователя
  getAll: async (
    userId: string,
  ): Promise<{ data: Transaction[] | null; error: string | null }> => {
    const supabase = createBrowserClient();

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

  // добавить транзакцию
  add: async (
    transaction: Omit<Transaction, "id" | "created_at">,
  ): Promise<{ data: Transaction | null; error: string | null }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("transactions")
      .insert(transaction)
      .select()
      .single();

    return {
      data: data as Transaction | null,
      error: error ? error.message : null,
    };
  },
};
