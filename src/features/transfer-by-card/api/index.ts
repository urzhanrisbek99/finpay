import { createBrowserClient } from "#shared/api";
import { transactionModel } from "#entities/transaction";
import { toMoneyErrorCode, MONEY_ERROR_UNKNOWN } from "#shared/lib";

type TransferResult = {
  transaction: transactionModel.Transaction;
  balance: number;
};

export const cardTransferApi = {
  // Наружу отдаём код ошибки, а не message — текст подставит словарь.
  send: async (
    amount: number,
    cardNumber: string,
    comment?: string,
  ): Promise<{
    data: transactionModel.Transaction | null;
    balance: number | null;
    errorCode: string | null;
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
