import { createBrowserClient } from "#shared/api/supabase/client";
import { transactionModel } from "#entities/transaction";

export const transferApi = {
  send: async (
    userId: string,
    amount: number,
    phone: string,
    comment?: string,
  ): Promise<{
    data: transactionModel.Transaction | null;
    error: string | null;
  }> => {
    const supabase = createBrowserClient();

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
      data: data as transactionModel.Transaction | null,
      error: error ? error.message : null,
    };
  },
};
