import { createBrowserClient } from "#shared/api";
import { ROUTES } from "#shared/config";
import {
  AUTH_ERROR_NETWORK,
  toAuthErrorCode,
  type ErrorWithCode,
} from "../lib/auth-error";

async function request<
  R extends { data: unknown; error: ErrorWithCode | null },
>(
  call: () => PromiseLike<R>,
): Promise<{ data: R["data"] | null; errorCode: string | null }> {
  try {
    const { data, error } = await call();
    return { data, errorCode: toAuthErrorCode(error) };
  } catch {
    return { data: null, errorCode: AUTH_ERROR_NETWORK };
  }
}

export const authApi = {
  signIn: async (email: string, password: string) => {
    const supabase = createBrowserClient();
    return request(() => supabase.auth.signInWithPassword({ email, password }));
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const supabase = createBrowserClient();
    return request(() =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      }),
    );
  },

  requestPasswordReset: async (email: string) => {
    const supabase = createBrowserClient();
    const { errorCode } = await request(() =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.AUTH_CONFIRM}`,
      }),
    );
    return { errorCode };
  },

  updatePassword: async (password: string) => {
    const supabase = createBrowserClient();
    const { errorCode } = await request(() =>
      supabase.auth.updateUser({ password }),
    );
    return { errorCode };
  },
};
