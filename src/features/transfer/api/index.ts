import { createBrowserClient } from "#shared/api";
import { transactionModel } from "#entities/transaction";
import { toMoneyErrorCode, MONEY_ERROR_UNKNOWN } from "#shared/lib";

type TransferResult = {
  transaction: transactionModel.Transaction;
  balance: number;
};

export const transferApi = {
  // user_id, проверка суммы, баланса, заморозки и лимита, списание — всё внутри
  // RPC transfer_money. Наружу отдаём код ошибки, а не message: сообщения
  // Postgres английские, а показать их надо на языке интерфейса.
  send: async (
    amount: number,
    phone: string,
    comment?: string,
  ): Promise<{
    data: transactionModel.Transaction | null;
    balance: number | null;
    errorCode: string | null;
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
        errorCode: toMoneyErrorCode(error) ?? MONEY_ERROR_UNKNOWN,
      };
    }

    const result = data as TransferResult;
    return {
      data: result.transaction,
      balance: result.balance,
      errorCode: null,
    };
  },
};
