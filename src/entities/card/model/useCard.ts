"use client";

import { useEffect } from "react";
import { createClient } from "@/src/shared/api/supabase/client";
import { cardApi } from "../api";
import { useCardStore } from "./store";

export function useCard() {
  const { card, setCard, setLoading, isLoading } = useCardStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await cardApi.getCard(user.id);

      if (data) {
        setCard(data);
      } else {
        const { data: newCard } = await supabase
          .from("cards")
          .insert({
            user_id: user.id,
            number: "4821",
            holder_name: "Urzhan Rysbek",
            expires_at: "08/28",
            type: "visa",
            is_frozen: false,
            spending_limit: 500000,
            spent: 184300,
          })
          .select()
          .single();

        if (newCard) setCard(newCard);
      }
      setLoading(false);
    };

    load();
  }, []);

  return { card, isLoading };
}
