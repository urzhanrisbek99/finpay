"use client";

import { useEffect } from "react";
import { createBrowserClient } from "#shared/api/supabase/client";
import { recipientApi } from "../api";
import { useRecipientStore } from "./store";

// Сохранённые получатели нужны на нескольких страницах (transfers + модалка
// перевода на дашборде), поэтому грузим один раз в AppShell с гардом hasLoaded.
export function useRecipients() {
  const { recipients, isLoading, hasLoaded, setRecipients, setLoading } =
    useRecipientStore();

  useEffect(() => {
    if (hasLoaded) return;

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

      const { data } = await recipientApi.getAll(user.id);
      if (data) setRecipients(data);
      setLoading(false);
    };

    load();
  }, [hasLoaded, setRecipients, setLoading]);

  return { recipients, isLoading, hasLoaded };
}
