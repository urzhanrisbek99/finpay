import { createBrowserClient } from "#shared/api/supabase/client";
import type { User } from "../model/types";

export const userApi = {
  getProfile: async (
    userId: string,
  ): Promise<{ data: User | null; error: string | null }> => {
    const supabase = createBrowserClient();

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

  updateBalance: async (
    userId: string,
    balance: number,
  ): Promise<{ error: string | null }> => {
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from("profiles")
      .update({ balance })
      .eq("id", userId);

    return { error: error ? error.message : null };
  },
  createProfile: async (profile: {
    id: string;
    email: string;
    full_name: string;
  }): Promise<{ error: string | null }> => {
    const supabase = createBrowserClient();

    const { error } = await supabase.from("profiles").insert({
      ...profile,
      balance: 1_240_500,
    });

    return { error: error ? error.message : null };
  },
};
