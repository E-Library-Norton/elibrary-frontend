"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/i18n/AppIntlProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Navbar");
  const { locale, setLocale } = useAppLocale();
  const nextLocale = locale === "en" ? "km" : "en";
  const isEnglish = locale === "en";

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      title={t("changeLanguage")}
      aria-label={t("changeLanguage")}
      aria-pressed={!isEnglish}
      className={cn(
        "relative inline-flex h-9 w-[88px] shrink-0 items-center rounded-full border border-slate-200 bg-white/90 text-[#334155] shadow-sm transition-colors hover:border-[#20659C]/40 hover:bg-[#20659C]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20659C]/30 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition-[left] duration-300 dark:border-slate-700 dark:bg-slate-950",
          isEnglish ? "left-[calc(100%-2rem)]" : "left-1",
        )}
      >
        <Image
          src={isEnglish ? "/en.webp" : "/kh.webp"}
          alt={isEnglish ? "English" : "Khmer"}
          width={32}
          height={20}
          className="h-full w-full object-cover"
        />
      </span>
      <span
        lang={isEnglish ? "en" : "km"}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-xs font-semibold leading-none transition-[left,right] duration-300",
          isEnglish ? "left-3" : "right-2.5 font-khmer",
        )}
      >
        {isEnglish ? "EN" : "ខ្មែរ"}
      </span>
    </button>
  );
}
