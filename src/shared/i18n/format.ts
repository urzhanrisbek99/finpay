"use client";

import { useCallback } from "react";
import { useI18n } from "./context";
import type { Locale } from "./config";

const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ru: "ru-RU",
};

// Локализованное форматирование даты для транзакций: «Сегодня, 14:30»,
// «Вчера, ...» или короткая дата в локали текущего языка.
export function useFormatDate() {
  const { locale, t } = useI18n();

  return useCallback(
    (date: string | Date): string => {
      const d = new Date(date);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      const time = d.toLocaleTimeString(INTL_LOCALE[locale], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      if (isToday) return t.transactions.today(time);
      if (isYesterday) return t.transactions.yesterday(time);
      return d.toLocaleDateString(INTL_LOCALE[locale], {
        month: "short",
        day: "numeric",
      });
    },
    [locale, t],
  );
}
