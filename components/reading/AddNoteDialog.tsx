"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  HIGHLIGHT_COLORS,
  type HighlightColor,
  type ReadingNote,
} from "@/types/reading";

const COLOR_CLASSES: Record<HighlightColor, string> = {
  yellow: "bg-yellow-300 ring-yellow-500",
  green: "bg-emerald-300 ring-emerald-500",
  blue: "bg-sky-300 ring-sky-500",
  pink: "bg-pink-300 ring-pink-500",
  purple: "bg-purple-300 ring-purple-500",
};

interface AddNoteDialogProps {
  open: boolean;
  bookTitle: string;
  pageNumber: number;
  selectedText: string;
  editingNote?: ReadingNote | null;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: {
    noteText: string;
    highlightColor: HighlightColor;
  }) => Promise<void>;
}

type NoteFormProps = Omit<
  AddNoteDialogProps,
  "open" | "onOpenChange"
> & {
  onCancel: () => void;
};

function NoteForm({
  bookTitle,
  pageNumber,
  selectedText,
  editingNote,
  isSaving = false,
  onSave,
  onCancel,
}: NoteFormProps) {
  const [noteText, setNoteText] = useState(editingNote?.noteText ?? "");
  const [highlightColor, setHighlightColor] = useState<HighlightColor>(
    editingNote?.highlightColor ?? "yellow"
  );

  async function handleSave() {
    await onSave({ noteText: noteText.trim(), highlightColor });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editingNote ? "Edit reading note" : "Add to notes"}
        </DialogTitle>
        <DialogDescription>
          {bookTitle} · Page {pageNumber}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-semibold">Selected text</p>
          <blockquote
            className={cn(
              "max-h-36 overflow-y-auto rounded-lg border-l-4 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200",
              highlightColor === "yellow" && "border-yellow-400",
              highlightColor === "green" && "border-emerald-400",
              highlightColor === "blue" && "border-sky-400",
              highlightColor === "pink" && "border-pink-400",
              highlightColor === "purple" && "border-purple-400"
            )}
          >
            {selectedText}
          </blockquote>
        </div>

        <div>
          <label
            htmlFor="personal-note"
            className="mb-1.5 block text-sm font-semibold"
          >
            Personal note
          </label>
          <Textarea
            id="personal-note"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            maxLength={50000}
            placeholder="Add your explanation, question, or reminder…"
            autoFocus
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            Highlight color
          </legend>
          <div className="flex flex-wrap gap-3">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`${color} highlight`}
                aria-pressed={highlightColor === color}
                onClick={() => setHighlightColor(color)}
                className={cn(
                  "h-7 w-7 rounded-full border-2 border-white shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20659C]",
                  COLOR_CLASSES[color],
                  highlightColor === color && "ring-2 ring-offset-2"
                )}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {editingNote ? "Save Changes" : "Save Note"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function AddNoteDialog({
  open,
  onOpenChange,
  ...formProps
}: AddNoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {open && (
          <NoteForm
            {...formProps}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
