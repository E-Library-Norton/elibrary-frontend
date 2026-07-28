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
      toast.success("Citation copied to clipboard");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Your browser could not copy the citation");
    }
  }

  function downloadCitation() {
    const content = [
      `${CITATION_STYLES.find((item) => item.value === style)?.label} citation`,
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
        Generate Citation
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generate book citation</DialogTitle>
            <DialogDescription>
              Your completion unlocks citations for this book.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                  Author
                </dt>
                <dd>{book.authors.join(", ") || "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">
                  Publisher
                </dt>
                <dd>{book.publisher || "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">
                  Publication year
                </dt>
                <dd>{book.publicationYear || "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">
                  ISBN
                </dt>
                <dd>{book.isbn || "Not provided"}</dd>
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
              Download
            </Button>
            <Button type="button" onClick={copyCitation}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy Citation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
