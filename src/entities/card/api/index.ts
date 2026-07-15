import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "#shared/api";
import type { Card } from "../model/types";

// cards закрыт табличным SELECT — читаем только разрешённые колонки (без cvv).
const CARD_COLUMNS =
  "id, user_id, number, holder_name, expires_at, type, is_frozen, spending_limit";

export const cardApi = {
  // Читаем и с клиента, и из SSR (передаётся серверный клиент из layout).
  getCard: async (
    userId: string,
    client?: SupabaseClient,
  ): Promise<{ data: Card | null; error: string | null }> => {
    const supabase = client ?? createBrowserClient();

    const { data, error } = await supabase
      .from("cards")
      .select(CARD_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle();

    return {
      data: data as Card | null,
      error: error ? error.message : null,
    };
  },

  // получить CVV своей карты — только через защищённую RPC (security definer)
  getCvv: async (
    cardId: string,
  ): Promise<{ data: string | null; error: string | null }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.rpc("get_card_cvv", {
      p_card_id: cardId,
    });

    return {
      data: (data as string | null) ?? null,
      error: error ? error.message : null,
    };
  },

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

  updateSpendingLimit: async (
    cardId: string,
    spendingLimit: number,
  ): Promise<{ error: string | null }> => {
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from("cards")
      .update({ spending_limit: spendingLimit })
      .eq("id", cardId);

    return { error: error ? error.message : null };
  },

  deleteCard: async (cardId: string): Promise<{ error: string | null }> => {
    const supabase = createBrowserClient();

    const { error } = await supabase.from("cards").delete().eq("id", cardId);

    return { error: error ? error.message : null };
  },
};
