import { createClient } from "@/src/shared/api/supabase/client";

export const authApi = {
  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error: error ? error.message : null };
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { data, error: error ? error.message : null };
  },

  signOut: async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  getUser: async () => {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error: error ? error.message : null };
  },
};
