import { createBrowserClient } from "#shared/api";
import { transactionModel } from "#entities/transaction";
import type { TransactionCategory } from "#shared/model";

type IncomeResult = {
  transaction: transactionModel.Transaction;
  balance: number;
};

export const addIncomeApi = {
  // Вставка транзакции и зачисление на баланс — атомарно в RPC add_income.
  add: async (
    amount: number,
    source: string,
    category: TransactionCategory,
  ): Promise<{
    data: transactionModel.Transaction | null;
    balance: number | null;
    error: string | null;
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
        error: error?.message ?? "Failed to add income",
      };
    }

    const result = data as IncomeResult;
    return { data: result.transaction, balance: result.balance, error: null };
  },
};
