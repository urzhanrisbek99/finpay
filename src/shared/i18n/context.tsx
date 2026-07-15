"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from "./config";
import { getDictionary, type Messages } from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

// Клиентский провайдер. Начальная локаль приходит с сервера (из куки), поэтому
// SSR и первый клиентский рендер совпадают — гидрация без мигания. Переключение
// меняет состояние (мгновенный ре-рендер), пишет куку и обновляет <html lang>.
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: getDictionary(locale) }),
    [locale, setLocale],
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
