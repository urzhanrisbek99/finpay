"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@/src/shared/api/supabase/client";
import { userApi } from "../api";
import { useUserStore } from "./store";

export function useUser() {
  const { user, setUser, setLoading, isLoading } = useUserStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data } = await userApi.getProfile(authUser.id);
      if (data) setUser(data);
      setLoading(false);
    };

    load();
  }, []);

  return { user, isLoading };
}
