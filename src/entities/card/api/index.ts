import { createBrowserClient } from "@/src/shared/api/supabase/client";
import type { Card } from "../model/types";

export const cardApi = {
  // получить карту пользователя
  getCard: async (
    userId: string,
  ): Promise<{ data: Card | null; error: string | null }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    return {
      data: data as Card | null,
      error: error ? error.message : null,
    };
  },

  // заморозить/разморозить карту
  toggleFreeze: async (
    cardId: string,
    isFrozen: boolean,
  ): Promise<{ error: string | null }> => {
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from("cards")
      .update({ is_frozen: isFrozen })
      .eq("id", cardId);

    return { error: error ? error.message : null };
  },

  // удалить карту
  deleteCard: async (cardId: string): Promise<{ error: string | null }> => {
    const supabase = createBrowserClient();

    const { error } = await supabase.from("cards").delete().eq("id", cardId);

    return { error: error ? error.message : null };
  },
};
