"use client";

import { useCallback } from "react";
import { sameZonedDay } from "#shared/lib";
import { useI18n } from "./context";
import type { Locale } from "./config";

const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ru: "ru-RU",
};

export function useFormatDate() {
  const { locale, t, timeZone } = useI18n();

  return useCallback(
    (date: string | Date): string => {
      const d = new Date(date);
      const now = new Date();
      const isToday = sameZonedDay(d, now, timeZone);

      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const isYesterday = sameZonedDay(d, yesterday, timeZone);

      const time = d.toLocaleTimeString(INTL_LOCALE[locale], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      });

      if (isToday) return t.transactions.today(time);
      if (isYesterday) return t.transactions.yesterday(time);
      return d.toLocaleDateString(INTL_LOCALE[locale], {
        month: "short",
        day: "numeric",
        timeZone,
      });
    },
    [locale, t, timeZone],
  );
}
