import { createBrowserClient } from "#shared/api";
import { ROUTES } from "#shared/config";
import { toAuthErrorCode } from "../lib/auth-error";

export const authApi = {
  signIn: async (email: string, password: string) => {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, errorCode: toAuthErrorCode(error) };
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { data, errorCode: toAuthErrorCode(error) };
  },

  // Письмо ведёт на /auth/confirm: секрет надо обменять на сессию на сервере.
  requestPasswordReset: async (email: string) => {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${ROUTES.AUTH_CONFIRM}`,
    });
    return { errorCode: toAuthErrorCode(error) };
  },

  updatePassword: async (password: string) => {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    return { errorCode: toAuthErrorCode(error) };
  },
};
