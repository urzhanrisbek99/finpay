import { createBrowserClient } from "@/src/shared/api/supabase/client";
import { transactionModel } from "@/src/entities/transaction";

export const qrPaymentApi = {
  create: async (
    amount: number,
    merchant: string,
    userId: string,
  ): Promise<{
    data: transactionModel.Transaction | null;
    error: string | null;
  }> => {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "expense",
        amount,
        merchant,
        category: "other",
        status: "pending",
      })
      .select()
      .single();

    return {
      data: data as transactionModel.Transaction | null,
      error: error ? error.message : null,
    };
  },

  // подписка на изменение статуса транзакции через Realtime
  subscribeToStatus: (
    transactionId: string,
    onStatusChange: (status: string) => void,
  ) => {
    const supabase = createBrowserClient();

    const channel = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          onStatusChange(payload.new.status);
        },
      )
      .subscribe();

    // возвращаем функцию отписки
    return () => {
      supabase.removeChannel(channel);
    };
  },

  // для демо — симулируем подтверждение через 3 сек
  simulateConfirm: (transactionId: string): void => {
    setTimeout(async () => {
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", transactionId);
    }, 3000);
  },
};
