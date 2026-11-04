"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  TIME_ZONE_COOKIE,
  type Locale,
} from "./config";
import { getDictionary, type Messages } from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
  timeZone: string;
};

const noSubscription = () => () => {};

const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  initialTimeZone,
  children,
}: {
  initialLocale: Locale;
  initialTimeZone: string;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const timeZone = useSyncExternalStore(
    noSubscription,
    browserTimeZone,
    () => initialTimeZone,
  );

  useEffect(() => {
    if (timeZone !== initialTimeZone) {
      document.cookie = `${TIME_ZONE_COOKIE}=${timeZone};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
    }
  }, [timeZone, initialTimeZone]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: getDictionary(locale), timeZone }),
    [locale, setLocale, timeZone],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Безопасный дефолт вне провайдера (например, в изолированных тестах).
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: getDictionary(DEFAULT_LOCALE),
      timeZone: DEFAULT_TIME_ZONE,
    };
  }
  return ctx;
}

// Удобный доступ только к словарю, когда переключатель не нужен.
export function useT(): Messages {
  return useI18n().t;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useTimeZone(): string {
  return useI18n().timeZone;
}
