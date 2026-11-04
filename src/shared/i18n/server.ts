import "server-only";

import { cookies } from "next/headers";
import { isValidTimeZone } from "#shared/lib";
import {
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
  LOCALE_COOKIE,
  TIME_ZONE_COOKIE,
  isLocale,
  type Locale,
} from "./config";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerTimeZone(): Promise<string> {
  const cookieStore = await cookies();
  const value = cookieStore.get(TIME_ZONE_COOKIE)?.value;
  return isValidTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}
