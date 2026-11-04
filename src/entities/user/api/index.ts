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
};
