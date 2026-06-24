import { createClient } from "@/src/shared/api/supabase/client";
import type { User } from "../model/types";

export const userApi = {
  // получить профиль пользователя
  getProfile: async (
    userId: string,
  ): Promise<{ data: User | null; error: string | null }> => {
    const supabase = createClient();

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

  // обновить баланс
  updateBalance: async (
    userId: string,
    balance: number,
  ): Promise<{ error: string | null }> => {
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ balance })
      .eq("id", userId);

    return { error: error ? error.message : null };
  },
};
