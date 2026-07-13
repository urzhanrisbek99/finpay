import { createBrowserClient } from "#shared/api/supabase/client";
import { userApi } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import type { TransactionCategory } from "#shared/types";

export const addIncomeApi = {
  add: async (
    userId: string,
    amount: number,
    source: string,
    category: TransactionCategory,
    currentBalance: number,
  ): Promise<{
    data: transactionModel.Transaction | null;
    balance: number | null;
    error: string | null;
  }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "income",
        amount,
        merchant: source,
        category,
        status: "completed",
      })
      .select()
      .single();

    if (error || !data) {
      return {
        data: null,
        balance: null,
        error: error?.message ?? "Failed to add income",
      };
    }

    const newBalance = currentBalance + amount;
    const { error: balanceError } = await userApi.updateBalance(
      userId,
      newBalance,
    );
    if (balanceError) {
      return { data: null, balance: null, error: balanceError };
    }

    return {
      data: data as transactionModel.Transaction,
      balance: newBalance,
      error: null,
    };
  },
};
