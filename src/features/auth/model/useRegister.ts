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
      // Профиль пишется от лица нового пользователя, поэтому без сессии
      // (включено подтверждение почты) RLS вставку отклонит. Ошибку показываем,
      // а не глотаем: иначе человек уходил на дашборд без профиля — без имени
      // и без баланса.
      const { error: profileError } = await userApi.createProfile({
        id: data.user.id,
        email,
        full_name: fullName,
      });

      if (profileError) {
        console.error("[register] profile creation failed:", profileError);
        setError(t.auth.errors.profileCreationFailed);
        setIsLoading(false);
        return;
      }

      router.push(ROUTES.DASHBOARD);
    }

    setIsLoading(false);
  };

  return { register, isLoading, error };
}
