"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import { getAuthErrorMessage } from "../lib/auth-error";
import { userApi } from "#entities/user";
import { ROUTES } from "#shared/config";
import { useT } from "#shared/i18n";

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useT();

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    setIsLoading(true);
    setError(null);

    const { data, errorCode } = await authApi.signUp(email, password, fullName);

    if (errorCode) {
      setError(getAuthErrorMessage(t, errorCode));
      setIsLoading(false);
      return;
    }

    if (data?.user) {
      await userApi.createProfile({
        id: data.user.id,
        email,
        full_name: fullName,
      });
      router.push(ROUTES.DASHBOARD);
    }

    setIsLoading(false);
  };

  return { register, isLoading, error };
}
