"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@/src/shared/api/supabase/client";
import { cardApi } from "../api";
import { useCardStore } from "./store";

export function useCard() {
  const { card, setCard, setLoading, isLoading } = useCardStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await cardApi.getCard(user.id);
      setCard(data);
      setLoading(false);
    };

    load();
  }, []);

  return { card, isLoading };
}
