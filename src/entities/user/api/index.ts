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

  // Баланс меняется только серверными RPC (transfer_money / add_income /
  // confirm_qr_payment). Прямого updateBalance у клиента больше нет —
  // право на UPDATE profiles отозвано в миграции 0006.
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
