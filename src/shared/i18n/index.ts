// Публичный API i18n (клиентская часть). Серверный хелпер getServerLocale
// импортируется напрямую из "#shared/i18n/server", т.к. помечен server-only.
export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "./config";
export { I18nProvider, useI18n, useT, useLocale } from "./context";
export { useFormatDate } from "./format";
// getDictionary — часть публичного API: словарь по локали нужен вне React
// (например, тестам маппинга ошибок), где хуки недоступны.
export { getDictionary, type Messages } from "./dictionaries";
