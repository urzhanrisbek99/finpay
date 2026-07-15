"use client";

import { useState } from "react";
import { authApi } from "../api";
import { getAuthErrorMessage } from "../lib/auth-error";
import { useT } from "#shared/i18n";

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const t = useT();

  const requestReset = async (email: string) => {
    setIsLoading(true);
    setError(null);

    const { errorCode } = await authApi.requestPasswordReset(email);

    if (errorCode) {
      setError(getAuthErrorMessage(t, errorCode));
    } else {
      // Экран успеха намеренно не сообщает, найден ли аккаунт: иначе форма
      // становится оракулом для перебора зарегистрированных адресов.
      setIsSent(true);
    }

    setIsLoading(false);
  };

  return { requestReset, isLoading, error, isSent };
}
