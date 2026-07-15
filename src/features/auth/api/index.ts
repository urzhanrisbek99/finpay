import { createBrowserClient } from "#shared/api";
import { ROUTES } from "#shared/config";
import { toAuthErrorCode } from "../lib/auth-error";

// Наружу отдаём код ошибки, а не message: сообщения Supabase существуют только
// на английском, а показать их надо на языке интерфейса. Перевод кода в текст —
// на стороне модели, у которой есть словарь.
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

  // Письмо ведёт на /auth/confirm, а не сразу на /reset-password: одноразовый
  // секрет нужно обменять на сессию на сервере, иначе кука не выставится.
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
