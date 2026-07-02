"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import { ROUTES } from "#shared/config";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    const { error } = await authApi.signIn(email, password);

    if (error) {
      setError(error);
    } else {
      router.push(ROUTES.DASHBOARD);
    }

    setIsLoading(false);
  };

  return { login, isLoading, error };
}
