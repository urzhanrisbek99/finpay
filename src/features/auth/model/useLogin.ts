"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import { getAuthErrorMessage } from "../lib/auth-error";
import { ROUTES } from "#shared/config";
import { useT } from "#shared/i18n";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useT();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    const { errorCode } = await authApi.signIn(email, password);

    if (errorCode) {
      setError(getAuthErrorMessage(t, errorCode));
    } else {
      router.push(ROUTES.DASHBOARD);
    }

    setIsLoading(false);
  };

  return { login, isLoading, error };
}
