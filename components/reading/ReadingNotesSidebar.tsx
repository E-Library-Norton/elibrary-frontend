"use client";

import {
  Edit3,
  Highlighter,
  Loader2,
  NotebookPen,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HighlightColor, ReadingNote } from "@/types/reading";

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
  onClose: () => void;
  onNavigate: (pageNumber: number) => void;
  onEdit: (note: ReadingNote) => void;
  onDelete: (noteId: number) => void;
}

export function ReadingNotesSidebar({
  open,
  notes,
  isLoading = false,
  deletingId,
  onClose,
  onNavigate,
  onEdit,
  onDelete,
}: ReadingNotesSidebarProps) {
  if (!open) return null;

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
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
        )}
      </div>
    </aside>
  );
}
