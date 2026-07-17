import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ═══════════════════════════════════════════════════════════════════
   Library Slice — Favorites, Reading Progress & Reading History
   Persisted to localStorage **per user** so each student keeps their
   own data across sessions.  Key format: elibrary_library_{userId}
   ═══════════════════════════════════════════════════════════════════ */

// ── Types ────────────────────────────────────────────────────────────────────
export interface FavoriteBook {
  id: number;
  title: string;
  coverUrl?: string | null;
  category?: string;
  addedAt: string; // ISO date
}

export interface ReadingProgress {
  bookId: number;
  title?: string;
  coverUrl?: string | null;
  currentPage: number;
  totalPages: number;
  lastReadAt: string; // ISO date
  /** Total seconds spent reading this book */
  timeSpentSeconds: number;
  /** ISO date when user reached the last page */
  completedAt?: string;
}

export interface ReadingHistoryEntry {
  bookId: number;
  title: string;
  coverUrl?: string | null;
  category?: string;
  readAt: string; // ISO date
}

export interface LibraryState {
  /** ID of the currently-active user (null = guest / not logged in) */
  userId: number | null;
  favorites: FavoriteBook[];
  readingProgress: Record<number, ReadingProgress>; // keyed by bookId
  recentlyViewed: ReadingHistoryEntry[];
}

// ── localStorage helpers (per-user) ──────────────────────────────────────────
const storageKeyFor = (userId: number) => `elibrary_library_${userId}`;

const EMPTY: Omit<LibraryState, "userId"> = {
  favorites: [],
  readingProgress: {},
  recentlyViewed: [],
};

function loadState(userId: number | null): LibraryState {
  if (typeof window === "undefined" || !userId) return { userId, ...EMPTY };
  try {
    const raw = localStorage.getItem(storageKeyFor(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return { userId, ...parsed };
    }
  } catch { /* ignore */ }
  return { userId, ...EMPTY };
}

function saveState(state: LibraryState) {
  if (typeof window === "undefined" || !state.userId) return;
  try {
    // Only persist the data fields, not the userId itself
    const { userId: _uid, ...data } = state;
    localStorage.setItem(storageKeyFor(state.userId), JSON.stringify(data));
  } catch { /* quota exceeded — ignore */ }
}

// ── Initial state (empty until a user is identified) ─────────────────────────
const initialState: LibraryState = { userId: null, ...EMPTY };

// ── Slice ────────────────────────────────────────────────────────────────────
const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    /* ── Favorites ── */
    toggleFavorite: (state, action: PayloadAction<FavoriteBook & { userId?: number | null }>) => {
      // Ensure userId is set so saveState doesn't skip persisting
      if (action.payload.userId && !state.userId) {
        state.userId = action.payload.userId;
      }
      const { userId: _uid, ...book } = action.payload;
      const idx = state.favorites.findIndex((f) => f.id === book.id);
      if (idx >= 0) {
        state.favorites.splice(idx, 1);
      } else {
        state.favorites.unshift(book);
      }
      saveState(state);
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter((f) => f.id !== action.payload);
      saveState(state);
    },

    /* ── Reading progress ── */
    updateReadingProgress: (state, action: PayloadAction<ReadingProgress>) => {
      state.readingProgress[action.payload.bookId] = action.payload;
      saveState(state);
    },
    /** Update only the page position — does NOT touch timeSpentSeconds */
    updateCurrentPage: (
      state,
      action: PayloadAction<{ bookId: number; currentPage: number; totalPages: number; title?: string; coverUrl?: string | null }>
    ) => {
      const { bookId, currentPage, totalPages, title, coverUrl } = action.payload;
      const existing = state.readingProgress[bookId];
      if (existing) {
        existing.currentPage = currentPage;
        existing.totalPages = totalPages;
        existing.lastReadAt = new Date().toISOString();
        // Preserve title/coverUrl if newly provided
        if (title && !existing.title) existing.title = title;
        if (coverUrl !== undefined && !existing.coverUrl) existing.coverUrl = coverUrl;
        // Auto-mark completed when reaching last page
        if (currentPage >= totalPages && totalPages > 0 && !existing.completedAt) {
          existing.completedAt = new Date().toISOString();
        }
      } else {
        const isComplete = currentPage >= totalPages && totalPages > 0;
        state.readingProgress[bookId] = {
          bookId,
          title,
          coverUrl,
          currentPage,
          totalPages,
          lastReadAt: new Date().toISOString(),
          timeSpentSeconds: 0,
          ...(isComplete ? { completedAt: new Date().toISOString() } : {}),
        };
      }
      saveState(state);
    },
    addReadingTime: (
      state,
      action: PayloadAction<{ bookId: number; seconds: number }>
    ) => {
      const prog = state.readingProgress[action.payload.bookId];
      if (prog) {
        prog.timeSpentSeconds += action.payload.seconds;
        prog.lastReadAt = new Date().toISOString();
        saveState(state);
      }
    },
    clearReadingProgress: (state, action: PayloadAction<number>) => {
      delete state.readingProgress[action.payload];
      saveState(state);
    },

    /* ── Recently viewed ── */
    addToRecentlyViewed: (state, action: PayloadAction<ReadingHistoryEntry>) => {
      // Remove duplicate
      state.recentlyViewed = state.recentlyViewed.filter(
        (e) => e.bookId !== action.payload.bookId
      );
      // Prepend
      state.recentlyViewed.unshift(action.payload);
      // Keep last 20
      if (state.recentlyViewed.length > 20) state.recentlyViewed.length = 20;
      saveState(state);
    },

    /* ── Hydrate from localStorage for a specific user ── */
    hydrateLibrary: (state, action: PayloadAction<number | null | undefined>) => {
      const uid = action.payload ?? null;
      const loaded = loadState(uid);
      state.userId = uid;
      state.favorites = loaded.favorites;
      state.readingProgress = loaded.readingProgress;
      state.recentlyViewed = loaded.recentlyViewed;
    },

    /* ── Clear everything on logout ── */
    clearLibrary: (state) => {
      state.userId = null;
      state.favorites = [];
      state.readingProgress = {};
      state.recentlyViewed = [];
    },
  },
});

export const {
  toggleFavorite,
  removeFavorite,
  updateReadingProgress,
  updateCurrentPage,
  addReadingTime,
  clearReadingProgress,
  addToRecentlyViewed,
  hydrateLibrary,
  clearLibrary,
} = librarySlice.actions;

export default librarySlice.reducer;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectFavorites = (state: { library: LibraryState }) =>
  state.library.favorites;

export const selectIsFavorite = (bookId: number) => (state: { library: LibraryState }) =>
  state.library.favorites.some((f) => f.id === bookId);

export const selectFavoriteCount = (state: { library: LibraryState }) =>
  state.library.favorites.length;

export const selectReadingProgress = (bookId: number) => (state: { library: LibraryState }) =>
  state.library.readingProgress[bookId] ?? null;

export const selectRecentlyViewed = (state: { library: LibraryState }) =>
  state.library.recentlyViewed;

export const selectAllReadingProgress = (state: { library: LibraryState }) =>
  state.library.readingProgress;

export const selectCompletedBooks = (state: { library: LibraryState }) =>
  Object.values(state.library.readingProgress).filter(
    (p) => p.completedAt || (p.currentPage >= p.totalPages && p.totalPages > 0)
  );
