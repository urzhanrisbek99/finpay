import { createBrowserClient } from "#shared/api/supabase/client";
import type { Card } from "#entities/card";

export type AddCardInput = {
  number: string;
  cvv: string;
  holder_name: string;
  expires_at: string;
  type: Card["type"];
  spending_limit: number;
};

export const addCardApi = {
  // создать новую карту пользователя
  create: async (
    userId: string,
    input: AddCardInput,
  ): Promise<{ data: Card | null; error: string | null }> => {
    const supabase = createBrowserClient();

    // храним только последние 4 цифры номера; CVV сохраняем как эмитент карты
    const number = input.number.replace(/\D/g, "").slice(-4);

    const { data, error } = await supabase
      .from("cards")
      .insert({
        user_id: userId,
        number,
        cvv: input.cvv,
        holder_name: input.holder_name,
        expires_at: input.expires_at,
        type: input.type,
        is_frozen: false,
        spending_limit: input.spending_limit,
        spent: 0,
      })
      // не возвращаем cvv обратно — колонка недоступна для прямого чтения
      .select(
        "id, user_id, number, holder_name, expires_at, type, is_frozen, spending_limit",
      )
      .single();

    return {
      data: data as Card | null,
      error: error ? error.message : null,
    };
  },
};
