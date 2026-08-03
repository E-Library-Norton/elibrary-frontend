"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Quote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CITATION_STYLES,
  generateCitation,
  type CitationBook,
  type CitationStyle,
} from "@/lib/citation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CitationDialogProps {
  book: CitationBook;
}

function safeFileName(title: string) {
  return (
    title
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) || "book"
  );
}

export function CitationDialog({ book }: CitationDialogProps) {
  const t = useTranslations("Library");
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [copied, setCopied] = useState(false);
  const citation = useMemo(
    () => generateCitation(book, style),
    [book, style]
  );

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      toast.success(t("citationCopied"));
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t("citationCopyFailed"));
    }
  }

  function downloadCitation() {
    const content = [
      t("citationFileHeading", {
        style: CITATION_STYLES.find((item) => item.value === style)?.label ?? style,
      }),
      "",
      citation,
      book.isbn ? `\nISBN: ${book.isbn}` : "",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeFileName(book.title)}-${style}-citation.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full shrink-0 sm:w-auto"
      >
        <Quote className="h-4 w-4" />
        {t("generateCitation")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("generateBookCitation")}</DialogTitle>
            <DialogDescription>
              {t("citationDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:grid-cols-4"
              role="tablist"
              aria-label={t("citationStyle")}
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
                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                    style === item.value
                      ? "bg-white text-[#20659C] shadow-sm dark:bg-slate-700 dark:text-sky-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="select-text text-sm leading-7 text-slate-800 dark:text-slate-100">
                {citation}
              </p>
            </div>

            <dl className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2 dark:text-slate-400">
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">
                  {t("author")}
                </dt>
                <dd>{book.authors.join(", ") || t("notProvided")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">
                  {t("publisher")}
                </dt>
                <dd>{book.publisher || t("notProvided")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">
                  {t("publicationYear")}
                </dt>
                <dd>{book.publicationYear || t("notProvided")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">
                  ISBN
                </dt>
                <dd>{book.isbn || t("notProvided")}</dd>
              </div>
            </dl>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={downloadCitation}
            >
              <Download className="h-4 w-4" />
              {t("download")}
            </Button>
            <Button type="button" onClick={copyCitation}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? t("copied") : t("copyCitation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
