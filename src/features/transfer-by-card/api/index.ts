import { createBrowserClient } from "#shared/api";
import { transactionModel } from "#entities/transaction";

type TransferResult = {
  transaction: transactionModel.Transaction;
  balance: number;
};

export const cardTransferApi = {
  send: async (
    amount: number,
    cardNumber: string,
    comment?: string,
  ): Promise<{
    data: transactionModel.Transaction | null;
    balance: number | null;
    error: string | null;
  }> => {
    const supabase = createBrowserClient();

    // храним только последние 4 цифры получателя — полный номер не сохраняем
    const last4 = cardNumber.replace(/\D/g, "").slice(-4);

    const { data, error } = await supabase.rpc("transfer_money", {
      p_amount: amount,
      p_merchant: `Transfer to card •••• ${last4}`,
      p_method: "card",
      p_comment: comment?.trim() || null,
    });

    if (error || !data) {
      return {
        data: null,
        balance: null,
        error: error?.message ?? "Transfer failed",
      };
    }

    const result = data as TransferResult;
    return { data: result.transaction, balance: result.balance, error: null };
  },
};
