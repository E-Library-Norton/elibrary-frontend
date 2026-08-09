"use client";

import {
  AlertCircle,
  Edit3,
  FileText,
  Highlighter,
  Lightbulb,
  Loader2,
  NotebookPen,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  HighlightColor,
  ReadingNote,
  ReadingNotesSummary,
} from "@/types/reading";

const BORDER_COLORS: Record<HighlightColor, string> = {
  yellow: "border-l-yellow-400",
  green: "border-l-emerald-400",
  blue: "border-l-sky-400",
  pink: "border-l-pink-400",
  purple: "border-l-purple-400",
};

interface ReadingNotesSidebarProps {
  open: boolean;
  notes: ReadingNote[];
  isLoading?: boolean;
  deletingId?: number | null;
  summary?: ReadingNotesSummary | null;
  isSummarizing?: boolean;
  summaryError?: string | null;
  onClose: () => void;
  onNavigate: (pageNumber: number) => void;
  onEdit: (note: ReadingNote) => void;
  onDelete: (noteId: number) => void;
  onSummarize: () => void;
}

export function ReadingNotesSidebar({
  open,
  notes,
  isLoading = false,
  deletingId,
  summary,
  isSummarizing = false,
  summaryError,
  onClose,
  onNavigate,
  onEdit,
  onDelete,
  onSummarize,
}: ReadingNotesSidebarProps) {
  if (!open) return null;

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <NotebookPen className="h-4 w-4 text-[#20659C] dark:text-sky-400" />
            Reading Notes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {notes.length} saved note{notes.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close reading notes"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#20659C]" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
            <Highlighter className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              No notes yet
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select text in the PDF to save a note or highlight.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="overflow-hidden rounded-2xl border border-[#20659C]/20 bg-gradient-to-br from-[#20659C]/[0.08] via-white to-sky-50 shadow-sm dark:from-[#20659C]/20 dark:via-slate-800 dark:to-slate-800">
              <div className="flex items-start justify-between gap-3 border-b border-[#20659C]/10 px-4 py-3 dark:border-slate-700">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Sparkles className="h-4 w-4 text-[#20659C] dark:text-sky-400" />
                    Overall Notes Summary
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Summarize every saved note and identify 1–2 key pages.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={onSummarize}
                  disabled={isSummarizing}
                  className="h-8 shrink-0 gap-1.5 bg-[#20659C] px-3 text-xs hover:bg-[#174c78]"
                >
                  {isSummarizing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : summary ? (
                    <RefreshCw className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {isSummarizing ? "Summarizing" : summary ? "Refresh" : "Summarize"}
                </Button>
              </div>

              {isSummarizing ? (
                <div className="space-y-3 px-4 py-4" aria-live="polite">
                  <div className="h-3 w-full animate-pulse rounded bg-[#20659C]/10" />
                  <div className="h-3 w-11/12 animate-pulse rounded bg-[#20659C]/10" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[#20659C]/10" />
                  <p className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                    Reading all {notes.length} notes…
                  </p>
                </div>
              ) : summaryError ? (
                <div className="flex items-start gap-2 px-4 py-4 text-sm text-red-700 dark:text-red-300" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Could not create the summary.</p>
                    <p className="mt-0.5 text-xs opacity-80">{summaryError}</p>
                  </div>
                </div>
              ) : summary ? (
                <div className="space-y-4 px-4 py-4">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {summary.summary}
                  </p>

                  {summary.keyPoints.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                        Key ideas
                      </h4>
                      <ul className="space-y-1.5">
                        {summary.keyPoints.map((point, index) => (
                          <li key={`${point}-${index}`} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#20659C]" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.keyPages.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        <FileText className="h-3.5 w-3.5 text-[#20659C] dark:text-sky-400" />
                        Key pages to review
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {summary.keyPages.map((page) => (
                          <button
                            key={page.pageNumber}
                            type="button"
                            onClick={() => onNavigate(page.pageNumber)}
                            className="rounded-xl border border-[#20659C]/25 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-[#20659C] hover:shadow-md dark:border-slate-600 dark:bg-slate-900 dark:hover:border-sky-400"
                          >
                            <span className="inline-flex rounded-full bg-[#20659C] px-2 py-0.5 text-[11px] font-bold text-white">
                              Page {page.pageNumber}
                            </span>
                            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                              {page.reason}
                            </p>
                            {page.excerpt && (
                              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                “{page.excerpt}”
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="border-t border-[#20659C]/10 pt-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Based on all {summary.noteCount} notes across {summary.coveredPages} page{summary.coveredPages === 1 ? "" : "s"}.
                  </p>
                </div>
              ) : (
                <div className="px-4 py-4 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Create one concise review from all notes below.
                  </p>
                </div>
              )}
            </section>

            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                All notes
              </span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className={cn(
                  "rounded-xl border border-l-4 border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800",
                  BORDER_COLORS[note.highlightColor]
                )}
              >
                <button
                  type="button"
                  onClick={() => onNavigate(note.pageNumber)}
                  className="w-full text-left"
                >
                  <span className="text-xs font-semibold text-[#20659C] dark:text-sky-400">
                    Page {note.pageNumber}
                  </span>
                  <blockquote className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    “{note.selectedText}”
                  </blockquote>
                  {note.noteText && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">
                      {note.noteText}
                    </p>
                  )}
                </button>
                <div className="mt-2 flex justify-end gap-1 border-t border-slate-100 pt-2 dark:border-slate-700">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(note)}
                    className="h-7 px-2"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={deletingId === note.id}
                    onClick={() => onDelete(note.id)}
                    className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                  >
                    {deletingId === note.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
