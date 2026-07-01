import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import { userApi } from "@/src/entities/user";

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await authApi.signUp(email, password, fullName);

    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    if (data?.user) {
      // создаём профиль в таблице profiles
      await userApi.createProfile({
        id: data.user.id,
        email,
        full_name: fullName,
      });
      router.push("/");
    }

    setIsLoading(false);
  };

  return { register, isLoading, error };
}
