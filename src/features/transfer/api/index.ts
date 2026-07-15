import { createBrowserClient } from "#shared/api";
import { transactionModel } from "#entities/transaction";

type TransferResult = {
  transaction: transactionModel.Transaction;
  balance: number;
};

export const transferApi = {
  // user_id, проверка баланса и лимита, списание — всё внутри RPC transfer_money.
  send: async (
    amount: number,
    phone: string,
    comment?: string,
  ): Promise<{
    data: transactionModel.Transaction | null;
    balance: number | null;
    error: string | null;
  }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.rpc("transfer_money", {
      p_amount: amount,
      p_merchant: `Transfer to ${phone}`,
      p_method: "phone",
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
