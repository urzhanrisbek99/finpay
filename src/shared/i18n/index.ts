// getServerLocale импортируется напрямую из #shared/i18n/server: он server-only.
export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "./config";
export { I18nProvider, useI18n, useT, useLocale } from "./context";
export { useFormatDate } from "./format";
export { getDictionary, type Messages } from "./dictionaries";
