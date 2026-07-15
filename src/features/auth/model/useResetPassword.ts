"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import { getAuthErrorMessage } from "../lib/auth-error";
import { ROUTES } from "#shared/config";
import { useT } from "#shared/i18n";

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useT();

  const resetPassword = async (password: string) => {
    setIsLoading(true);
    setError(null);

    const { errorCode } = await authApi.updatePassword(password);

    if (errorCode) {
      setError(getAuthErrorMessage(t, errorCode));
      setIsLoading(false);
      return;
    }

    // Ссылка из письма уже дала сессию, так что после смены пароля пользователь
    // залогинен — вести его снова на /login незачем.
    router.push(ROUTES.DASHBOARD);
    setIsLoading(false);
  };

  return { resetPassword, isLoading, error };
}
