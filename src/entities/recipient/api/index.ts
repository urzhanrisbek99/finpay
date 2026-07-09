import { createBrowserClient } from "#shared/api/supabase/client";
import type { Recipient } from "../model/types";

export const recipientApi = {
  // получить сохранённых получателей пользователя (свежие сверху)
  getAll: async (
    userId: string,
  ): Promise<{ data: Recipient[] | null; error: string | null }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("recipients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return {
      data: data as Recipient[] | null,
      error: error ? error.message : null,
    };
  },

  // сохранить получателя; при совпадении user_id+phone обновляем имя
  save: async (
    userId: string,
    name: string,
    phone: string,
  ): Promise<{ data: Recipient | null; error: string | null }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("recipients")
      .upsert({ user_id: userId, name, phone }, { onConflict: "user_id,phone" })
      .select()
      .single();

    return {
      data: data as Recipient | null,
      error: error ? error.message : null,
    };
  },
};
