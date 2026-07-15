import { createBrowserClient } from "#shared/api";
import { transactionModel } from "#entities/transaction";
import { toMoneyErrorCode, MONEY_ERROR_UNKNOWN } from "#shared/lib";

export const qrPaymentApi = {
  // Создаём pending-платёж через RPC: сервер проверяет баланс, заморозку и
  // лимит и берёт user_id из auth.uid(). Баланс на этом шаге ещё не
  // списывается. Наружу отдаём код ошибки — текст подставит словарь.
  create: async (
    amount: number,
    merchant: string,
  ): Promise<{
    data: transactionModel.Transaction | null;
    errorCode: string | null;
  }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.rpc("create_qr_payment", {
      p_amount: amount,
      p_merchant: merchant,
    });

    if (error || !data) {
      return {
        data: null,
        errorCode: toMoneyErrorCode(error) ?? MONEY_ERROR_UNKNOWN,
      };
    }

    const result = data as { transaction: transactionModel.Transaction };
    return { data: result.transaction, errorCode: null };
  },

  // Симуляция вебхука эквайера. Подтверждение и списание баланса делает
  // серверный RPC confirm_qr_payment атомарно и идемпотентно — клиент лишь
  // инициирует его (перенос самого триггера на сервер — отдельный шаг).
  simulateConfirm: (transactionId: string): void => {
    setTimeout(async () => {
      const supabase = createBrowserClient();
      const { error } = await supabase.rpc("confirm_qr_payment", {
        p_transaction_id: transactionId,
      });
      if (error) console.error("[qr-payment] confirm failed:", error.message);
    }, 3000);
  },
};
