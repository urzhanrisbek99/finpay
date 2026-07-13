"use client";

import { useEffect } from "react";
import { createBrowserClient } from "#shared/api/supabase/client";
import { transactionApi } from "../api";
import { useTransactionStore } from "./store";

export function useTransactions() {
  const { transactions, isLoading, hasLoaded, setTransactions, setLoading } =
    useTransactionStore();

  useEffect(() => {
    if (hasLoaded) return;

    const load = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await transactionApi.getAll(user.id);
      if (data) setTransactions(data);
      setLoading(false);
    };

    load();
  }, [hasLoaded, setTransactions, setLoading]);

  return { transactions, isLoading, hasLoaded };
}
