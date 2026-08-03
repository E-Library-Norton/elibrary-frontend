"use client";

import { useState } from "react";
import { Check, Copy, Quote } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  CITATION_STYLES,
  generateCitation,
  type CitationBook,
  type CitationStyle,
} from "@/lib/citation";
import { cn } from "@/lib/utils";

interface BookCitationCardProps {
  book: CitationBook;
}

export function BookCitationCard({ book }: BookCitationCardProps) {
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [copied, setCopied] = useState(false);
  const citation = generateCitation(book, style);
  const activeStyle =
    CITATION_STYLES.find((item) => item.value === style) ??
    CITATION_STYLES[0];

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      toast.success("Citation copied to clipboard");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Your browser could not copy the citation");
    }
  }

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-800 sm:px-6">
        <Quote className="h-5 w-5 text-[#20659C] dark:text-[#55B9EA]" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          Cite this book
        </h2>
      </div>

      <CardContent className="space-y-4 p-5 sm:p-6">
        <div
          className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:grid-cols-4"
          role="tablist"
          aria-label="Citation style"
        >
          {CITATION_STYLES.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={style === item.value}
              onClick={() => {
                setStyle(item.value);
                setCopied(false);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                style === item.value
                  ? "bg-white text-[#20659C] shadow-sm dark:bg-slate-700 dark:text-[#55B9EA]"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-5 pr-14 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="select-text font-sans text-sm leading-7 text-slate-800 dark:text-slate-100 sm:text-base">
            {citation}
          </p>
          <button
            type="button"
            onClick={copyCitation}
            title={copied ? "Citation copied" : "Copy citation"}
            aria-label={copied ? "Citation copied" : "Copy citation"}
            className={cn(
              "absolute right-4 top-4 rounded-lg p-2 transition-colors",
              copied
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "text-slate-400 hover:bg-slate-200 hover:text-[#20659C] dark:hover:bg-slate-700 dark:hover:text-[#55B9EA]"
            )}
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {activeStyle.description}
        </p>
      </CardContent>
    </Card>
  );
}
