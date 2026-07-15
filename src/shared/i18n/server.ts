import "server-only";

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";

// Читает выбранный язык из куки на сервере — для <html lang> и SSR словаря.
// Использование cookies() переводит роут в динамический рендер, что здесь
// уместно: приложение и так за auth-гейтом и рендерится по запросу.
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
