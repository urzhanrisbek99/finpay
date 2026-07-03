"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "#shared/api/supabase/client";
import { transactionApi } from "../api";

// сумма расходов текущего пользователя за текущий месяц
export function useMonthlySpent() {
  const [spent, setSpent] = useState(0);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await transactionApi.getMonthlySpent(user.id);
      setSpent(data);
    };

    load();
  }, []);

  return { spent };
}
