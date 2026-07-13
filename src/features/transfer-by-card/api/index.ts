import { createBrowserClient } from "#shared/api/supabase/client";
import { transactionModel } from "#entities/transaction";

export const cardTransferApi = {
  send: async (
    userId: string,
    amount: number,
    cardNumber: string,
    comment?: string,
  ): Promise<{
    data: transactionModel.Transaction | null;
    error: string | null;
  }> => {
    const supabase = createBrowserClient();

    // храним только последние 4 цифры получателя — полный номер не сохраняем
    const last4 = cardNumber.replace(/\D/g, "").slice(-4);

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "transfer",
        amount,
        merchant: `Transfer to card •••• ${last4}`,
        category: "transfer",
        status: "completed",
        comment: comment?.trim() || null,
        method: "card",
      })
      .select()
      .single();

    return {
      data: data as transactionModel.Transaction | null,
      error: error ? error.message : null,
    };
  },
};
