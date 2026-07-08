"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { qrPaymentApi } from "../api";
import { userApi, userModel } from "#entities/user";
import { transactionModel, transactionApi } from "#entities/transaction";
import { cardApi } from "#entities/card";
import { createBrowserClient } from "#shared/api/supabase/client";
import { POLLING_INTERVAL } from "#shared/config";

type PaymentState = "idle" | "pending" | "completed" | "failed";

export function useQRPayment() {
  const [state, setState] = useState<PaymentState>("idle");
  const [transaction, setTransaction] =
    useState<transactionModel.Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // чтобы списать баланс ровно один раз, даже если polling заметит completed дважды
  const settledRef = useRef(false);

  const user = userModel.useUserStore((s) => s.user);
  const addTransaction = transactionModel.useTransactionStore(
    (s) => s.addTransaction,
  );
  const updateTransactionStatus = transactionModel.useTransactionStore(
    (s) => s.updateTransactionStatus,
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // списывает сумму платежа с баланса ровно один раз
  const settleBalance = useCallback(async (amount: number) => {
    if (settledRef.current) return;
    settledRef.current = true;

    const { user: current, setBalance } = userModel.useUserStore.getState();
    if (!current) return;

    const newBalance = current.balance - amount;
    await userApi.updateBalance(current.id, newBalance);
    setBalance(newBalance);
  }, []);

  const startPolling = useCallback(
    (transactionId: string, amount: number) => {
      const supabase = createBrowserClient();

      intervalRef.current = setInterval(async () => {
        const { data } = await supabase
          .from("transactions")
          .select("status")
          .eq("id", transactionId)
          .single();

        if (data?.status === "completed") {
          setState("completed");
          stopPolling();
          // синхронизируем строку в сторе и уменьшаем баланс
          updateTransactionStatus(transactionId, "completed");
          void settleBalance(amount);
        } else if (data?.status === "failed") {
          setState("failed");
          stopPolling();
          updateTransactionStatus(transactionId, "failed");
        }
      }, POLLING_INTERVAL);
    },
    [stopPolling, settleBalance, updateTransactionStatus],
  );

  const createPayment = useCallback(
    async (amount: number, merchant: string) => {
      if (!user) return;
      if (amount > user.balance) {
        setState("failed");
        setError("Insufficient balance");
        return;
      }
      settledRef.current = false;
      setState("pending");
      setError(null);

      // проверяем месячный лимит карты
      const [{ data: card }, { data: spent }] = await Promise.all([
        cardApi.getCard(user.id),
        transactionApi.getMonthlySpent(user.id),
      ]);
      if (card && spent + amount > card.spending_limit) {
        setState("failed");
        setError("This payment exceeds your monthly card limit");
        return;
      }

      const { data, error } = await qrPaymentApi.create(
        amount,
        merchant,
        user.id,
      );

      if (error || !data) {
        setState("failed");
        setError(error);
        return;
      }

      setTransaction(data);
      addTransaction(data);

      // симулируем подтверждение через 3 сек
      qrPaymentApi.simulateConfirm(data.id);

      // polling каждые 2 сек
      startPolling(data.id, data.amount);
    },
    [user, addTransaction, startPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    settledRef.current = false;
    setState("idle");
    setTransaction(null);
    setError(null);
  }, [stopPolling]);

  // очищаем при размонтировании
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { state, transaction, error, createPayment, reset };
}
