"use client";

import { Copy, Highlighter, NotebookPen } from "lucide-react";

interface TextSelectionPopupProps {
  left: number;
  top: number;
  onAddNote: () => void;
  onCopy: () => void;
  onHighlight: () => void;
}

export function TextSelectionPopup({
  left,
  top,
  onAddNote,
  onCopy,
  onHighlight,
}: TextSelectionPopupProps) {
  const actionClass =
    "flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700";

  return (
    <div
      className="fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-1 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      style={{
        left: Math.min(window.innerWidth - 150, Math.max(150, left)),
        top: Math.max(58, top - 8),
      }}
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={(event) => event.stopPropagation()}
    >
      <button type="button" className={actionClass} onClick={onAddNote}>
        <NotebookPen className="h-3.5 w-3.5" />
        Add to Notes
      </button>
      <button type="button" className={actionClass} onClick={onCopy}>
        <Copy className="h-3.5 w-3.5" />
        Copy
      </button>
      <button type="button" className={actionClass} onClick={onHighlight}>
        <Highlighter className="h-3.5 w-3.5" />
        Highlight
      </button>
    </div>
  );
}
