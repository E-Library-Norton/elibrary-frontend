export const SUPPORTED_LOCALES = ["en", "km"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_STORAGE_KEY = "norton-elibrary:locale";

export function isAppLocale(value: unknown): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}
