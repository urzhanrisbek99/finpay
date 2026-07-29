import type { Locale } from "../config";
import { en, type Messages } from "./en";
import { ru } from "./ru";

export const dictionaries: Record<Locale, Messages> = { en, ru };

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}

export type { Messages };
