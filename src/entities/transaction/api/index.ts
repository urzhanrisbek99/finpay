import { createBrowserClient } from "#shared/api/supabase/client";
import type { Transaction } from "../model/types";

export const transactionApi = {
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

  getMonthlySpent: async (
    userId: string,
  ): Promise<{ data: number; error: string | null }> => {
    const supabase = createBrowserClient();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .in("type", ["expense", "transfer"])
      .neq("status", "failed")
      .gte("created_at", monthStart.toISOString());

    const spent = (data ?? []).reduce((sum, row) => sum + (row.amount ?? 0), 0);

    return { data: spent, error: error ? error.message : null };
  },

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
