"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";
import kmMessages from "@/messages/km.json";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type AppLocale,
  isAppLocale,
} from "@/i18n/config";

const messages = {
  en: enMessages,
  km: kmMessages,
} as const;

interface AppLocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

const AppLocaleContext = createContext<AppLocaleContextValue | null>(null);

export function AppIntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<AppLocale>(DEFAULT_LOCALE);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    updateLocale(nextLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    const browserLocale: AppLocale = navigator.language
      .toLowerCase()
      .startsWith("km")
      ? "km"
      : DEFAULT_LOCALE;
    const initialLocale = isAppLocale(savedLocale)
      ? savedLocale
      : browserLocale;
    if (initialLocale === DEFAULT_LOCALE) return;

    const timer = window.setTimeout(() => setLocale(initialLocale), 0);
    return () => window.clearTimeout(timer);
  }, [setLocale]);

  const contextValue = useMemo(
    () => ({ locale, setLocale }),
    [locale, setLocale],
  );

  return (
    <AppLocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale]}
        timeZone="Asia/Phnom_Penh"
      >
        {children}
      </NextIntlClientProvider>
    </AppLocaleContext.Provider>
  );
}

export function useAppLocale() {
  const context = useContext(AppLocaleContext);
  if (!context) {
    throw new Error("useAppLocale must be used inside AppIntlProvider");
  }
  return context;
}
