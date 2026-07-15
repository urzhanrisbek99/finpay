import type { Locale } from "../config";
import { en, type Messages } from "./en";
import { ru } from "./ru";

// Оба словаря импортируются статически и попадают в клиентский бандл. Это
// позволяет переключать язык мгновенно (без запроса к серверу и без мигания),
// а SSR отрисовывает нужный словарь сразу по локали из куки.
export const dictionaries: Record<Locale, Messages> = { en, ru };

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}

export type { Messages };
