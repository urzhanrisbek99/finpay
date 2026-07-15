export const LOCALES = ["en", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Кука, в которой хранится выбранный язык. Читается на сервере (для <html lang>
// и SSR) и пишется на клиенте при переключении — по аналогии с темой.
export const LOCALE_COOKIE = "locale";

// Год жизни куки, чтобы выбор языка сохранялся между сессиями.
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}
