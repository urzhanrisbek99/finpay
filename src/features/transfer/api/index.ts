import { createClient } from "@/src/shared/api/supabase/client";
import type { Transaction } from "@/src/entities/transaction/model/types";

export const transferApi = {
  send: async (
    userId: string,
    amount: number,
    phone: string,
    comment?: string,
  ): Promise<{ data: Transaction | null; error: string | null }> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "transfer",
        amount,
        merchant: `Transfer to ${phone}`,
        category: "transfer",
        status: "completed",
      })
      .select()
      .single();

    return {
      data: data as Transaction | null,
      error: error ? error.message : null,
    };
  },
};
