"use client";

import { Bookmark, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bookmark as BookmarkType } from "@/types/reading";

interface BookmarkSidebarProps {
  open: boolean;
  bookmarks: BookmarkType[];
  isLoading?: boolean;
  deletingId?: number | null;
  onClose: () => void;
  onNavigate: (pageNumber: number) => void;
  onDelete: (bookmarkId: number) => void;
}

export function BookmarkSidebar({
  open,
  bookmarks,
  isLoading = false,
  deletingId,
  onClose,
  onNavigate,
  onDelete,
}: BookmarkSidebarProps) {
  if (!open) return null;

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Bookmark className="h-4 w-4 text-[#20659C] dark:text-sky-400" />
            Bookmarks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {bookmarks.length} saved page{bookmarks.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close bookmarks"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#20659C]" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
            <Bookmark className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              No bookmarks yet
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Save an important page from the reader toolbar.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((bookmark) => (
              <li
                key={bookmark.id}
                className="group flex items-center gap-2 rounded-xl border border-slate-200 p-2 transition hover:border-[#20659C]/50 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 p-1 text-left"
                  onClick={() => onNavigate(bookmark.pageNumber)}
                >
                  <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {bookmark.title || `Page ${bookmark.pageNumber}`}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Page {bookmark.pageNumber}
                  </span>
                </button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={deletingId === bookmark.id}
                  onClick={() => onDelete(bookmark.id)}
                  className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  aria-label={`Delete bookmark for page ${bookmark.pageNumber}`}
                >
                  {deletingId === bookmark.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
