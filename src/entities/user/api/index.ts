import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "#shared/api";
import type { User } from "../model/types";

export const userApi = {
  getProfile: async (
    userId: string,
    client?: SupabaseClient,
  ): Promise<{ data: User | null; error: string | null }> => {
    const supabase = client ?? createBrowserClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return {
      data: data as User | null,
      error: error ? error.message : null,
    };
  },

  // Баланс меняют только серверные RPC: UPDATE на profiles отозван в 0006.
  createProfile: async (profile: {
    id: string;
    email: string;
    full_name: string;
  }): Promise<{ error: string | null }> => {
    const supabase = createBrowserClient();

    // balance не передаём — стартовое значение задаёт DEFAULT в БД.
    const { error } = await supabase.from("profiles").insert(profile);

    return { error: error ? error.message : null };
  },
};
