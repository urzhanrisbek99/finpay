import { createBrowserClient } from "#shared/api";
import { transactionModel } from "#entities/transaction";
import type { TransactionCategory } from "#shared/model";
import { toMoneyErrorCode, MONEY_ERROR_UNKNOWN } from "#shared/lib";

type IncomeResult = {
  transaction: transactionModel.Transaction;
  balance: number;
};

export const addIncomeApi = {
  // Вставка транзакции и зачисление на баланс — атомарно в RPC add_income.
  // Наружу отдаём код ошибки, а не message — текст подставит словарь.
  add: async (
    amount: number,
    source: string,
    category: TransactionCategory,
  ): Promise<{
    data: transactionModel.Transaction | null;
    balance: number | null;
    errorCode: string | null;
  }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.rpc("add_income", {
      p_amount: amount,
      p_source: source,
      p_category: category,
    });

    if (error || !data) {
      return {
        data: null,
        balance: null,
        errorCode: toMoneyErrorCode(error) ?? MONEY_ERROR_UNKNOWN,
      };
    }

    const result = data as IncomeResult;
    return {
      data: result.transaction,
      balance: result.balance,
      errorCode: null,
    };
  },
};
