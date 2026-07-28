"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookmarkButtonProps {
  pageNumber: number;
  isBookmarked: boolean;
  isSaving?: boolean;
  onSave: (title?: string) => Promise<void>;
}

export function BookmarkButton({
  pageNumber,
  isBookmarked,
  isSaving = false,
  onSave,
}: BookmarkButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  async function handleSave() {
    await onSave(title.trim() || undefined);
    setOpen(false);
    setTitle("");
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={isBookmarked}
        onClick={() => setOpen(true)}
        className="h-8 px-2.5 text-slate-200 hover:bg-slate-700 hover:text-white disabled:text-emerald-400"
        aria-label={
          isBookmarked ? `Page ${pageNumber} is bookmarked` : "Bookmark page"
        }
      >
        {isBookmarked ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        <span className="hidden md:inline">
          {isBookmarked ? "Saved" : "Bookmark"}
        </span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setTitle("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bookmark page {pageNumber}</DialogTitle>
            <DialogDescription>
              Add an optional title to make this page easier to find.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            placeholder={`Page ${pageNumber}`}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleSave();
            }}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
