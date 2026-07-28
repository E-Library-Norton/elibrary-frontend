import type {
  BookAuthor,
  BookCategory,
  BookPublisher,
} from "@/types";

export const HIGHLIGHT_COLORS = [
  "yellow",
  "green",
  "blue",
  "pink",
  "purple",
] as const;

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

export interface ReadingProgress {
  id: number;
  userId: number;
  bookId: number;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  lastReadAt: string;
  completedAt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: number;
  userId: number;
  bookId: number;
  pageNumber: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingNote {
  id: number;
  userId: number;
  bookId: number;
  pageNumber: number;
  selectedText: string;
  noteText: string | null;
  highlightColor: HighlightColor;
  created_at: string;
  updated_at: string;
}

export interface ReadingLibraryBook {
  id: number;
  title: string;
  titleKh?: string | null;
  coverUrl: string | null;
  pages: number | null;
  categoryId: number;
  publicationYear?: number | null;
  publisherId?: number | null;
  isbn?: string | null;
  Category?: BookCategory | null;
  Authors?: BookAuthor[];
  Publisher?: BookPublisher | null;
}

export interface ReadingLibraryItem extends ReadingProgress {
  Book: ReadingLibraryBook;
  bookmarkCount: number;
  noteCount: number;
}

export interface UpdateReadingProgressInput {
  bookId: string | number;
  currentPage: number;
  totalPages: number;
}

export interface CreateBookmarkInput {
  bookId: string | number;
  pageNumber: number;
  title?: string;
}

export interface CreateReadingNoteInput {
  bookId: string | number;
  pageNumber: number;
  selectedText: string;
  noteText?: string;
  highlightColor?: HighlightColor;
}

export interface UpdateReadingNoteInput {
  bookId: string | number;
  noteId: string | number;
  noteText?: string;
  highlightColor?: HighlightColor;
}
