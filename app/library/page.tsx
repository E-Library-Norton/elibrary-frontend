"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  BookOpen,
  Clock,
  Eye,
  Trash2,
  ChevronRight,
  BookMarked,
  TrendingUp,
  Loader2,
  Search,
  X,
  CheckCircle2,
  StickyNote,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  selectFavorites,
  selectRecentlyViewed,
  removeFavorite,
  hydrateLibrary,
  updateReadingProgress,
  type FavoriteBook,
  type ReadingHistoryEntry,
} from "@/store/slices/librarySlice";
import { useGetReadingLibraryQuery } from "@/store/api/readingApi";
import { ReadingProgressBar } from "@/components/reading/ReadingProgressBar";
import { ContinueReadingButton } from "@/components/reading/ContinueReadingButton";
import { CitationDialog } from "@/components/reading/CitationDialog";

interface LibraryProgressView {
  bookId: number;
  title: string;
  coverUrl?: string | null;
  category?: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: string;
  completedAt: string | null;
  bookmarkCount: number;
  noteCount: number;
  timeSpentSeconds: number;
  authors: string[];
  publisher?: string | null;
  publicationYear?: number | null;
  isbn?: string | null;
}

// ── Cover fallback ───────────────────────────────────────────────────────────
function BookCover({
  bookId,
  title,
  className,
}: {
  bookId: number;
  title: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  // Always attempt the proxy endpoint — it works even if coverUrl isn't stored
  // locally yet (e.g. old localStorage entries before the title/coverUrl fix).
  if (!imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/books/${bookId}/cover`}
        alt={title}
        onError={() => setImgError(true)}
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] flex items-center justify-center">
      <BookOpen className="w-8 h-8 text-white/50" />
    </div>
  );
}

// ── Stats card ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-[#E2E8F0]/60 dark:border-gray-800/60 p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          accent
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
          {value}
        </p>
        <p className="text-xs text-[#9CA3AF] font-medium">{label}</p>
      </div>
    </div>
  );
}

// ── Tab button 
type TabId = "favorites" | "reading" | "completed" | "history";

function TabButton({
  id,
  active,
  label,
  icon: Icon,
  count,
  onClick,
}: {
  id: TabId;
  active: boolean;
  label: string;
  icon: React.ElementType;
  count?: number;
  onClick: (id: TabId) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap shrink-0",
        active
          ? "bg-[#20659C] text-white shadow-md shadow-[#20659C]/20"
          : "text-[#5E5E5E] dark:text-gray-400 hover:bg-[#20659C]/5 dark:hover:bg-gray-800 hover:text-[#20659C] dark:hover:text-[#55B9EA]"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5",
            active
              ? "bg-white/20 text-white"
              : "bg-[#E2E8F0] dark:bg-gray-700 text-[#5E5E5E] dark:text-gray-300"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#9CA3AF]" />
      </div>
      <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#5E5E5E] dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      <Button asChild className="gap-2 bg-[#20659C] hover:bg-[#55B9EA]">
        <Link href="/books">
          <Search className="w-4 h-4" /> Browse Books
        </Link>
      </Button>
    </div>
  );
}

function ProgressBookCard({
  progress,
  animationDelay,
}: {
  progress: LibraryProgressView;
  animationDelay: string;
}) {
  const isCompleted =
    Boolean(progress.completedAt) ||
    (progress.totalPages > 0 &&
      progress.currentPage >= progress.totalPages);

  return (
    <Card
      className="overflow-hidden border-[#E2E8F0]/60 bg-white/80 opacity-0 shadow-sm backdrop-blur-sm animate-[heroReveal_0.5s_ease_forwards] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/80"
      style={{ animationDelay }}
    >
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <Link
          href={`/books/${progress.bookId}?from=%2Flibrary`}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          <div className="h-[88px] w-16 shrink-0 overflow-hidden rounded-lg shadow-sm">
            <BookCover
              bookId={progress.bookId}
              title={progress.title}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h4 className="line-clamp-1 text-sm font-bold text-[#1A1A1A] dark:text-white">
                {progress.title}
              </h4>
              {isCompleted && (
                <Badge className="border-0 bg-emerald-500 text-[10px] text-white">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
              {progress.category && (
                <Badge
                  variant="outline"
                  className="border-[#E2E8F0] text-[10px] text-[#5E5E5E] dark:border-gray-700 dark:text-gray-300"
                >
                  {progress.category}
                </Badge>
              )}
            </div>
            <ReadingProgressBar
              currentPage={progress.currentPage}
              totalPages={progress.totalPages}
              lastReadAt={progress.lastReadAt}
            />
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#5E5E5E] dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5" />
                {progress.bookmarkCount} bookmark
                {progress.bookmarkCount === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1">
                <StickyNote className="h-3.5 w-3.5" />
                {progress.noteCount} note
                {progress.noteCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </Link>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
          <ContinueReadingButton
            bookId={progress.bookId}
            pageNumber={progress.currentPage}
            className="w-full shrink-0 sm:w-auto"
          />
          {isCompleted && (
            <CitationDialog
              book={{
                id: progress.bookId,
                title: progress.title,
                authors: progress.authors,
                publisher: progress.publisher,
                publicationYear: progress.publicationYear,
                isbn: progress.isbn,
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   LIBRARY DASHBOARD PAGE
   ═══════════════════════════════════════════════ */
export default function LibraryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const dispatch = useAppDispatch();

  const favorites = useAppSelector(selectFavorites);
  const recentlyViewed = useAppSelector(selectRecentlyViewed);
  const allProgress = useAppSelector(
    (state) => state.library.readingProgress
  );
  const {
    data: readingLibraryResponse,
    isLoading: isReadingLibraryLoading,
    isError: isReadingLibraryError,
  } = useGetReadingLibraryQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [activeTab, setActiveTab] = useState<TabId>("favorites");
  const [searchQuery, setSearchQuery] = useState("");

  // Hydrate per-user library data
  useEffect(() => {
    if (user?.id) dispatch(hydrateLibrary(user.id));
  }, [dispatch, user?.id]);

  // Auth guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/auth/signin");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Backfill title/coverUrl for old localStorage entries that are missing them
  useEffect(() => {
    const stale = Object.values(allProgress).filter((p) => !p.title);
    if (!stale.length) return;
    stale.forEach(async (prog) => {
      try {
        const res = await fetch(`/api/books/${prog.bookId}`);
        if (!res.ok) return;
        const book = await res.json();
        dispatch(
          updateReadingProgress({
            ...prog,
            title: book.title ?? `Book #${prog.bookId}`,
            coverUrl: book.coverUrl ?? null,
          })
        );
      } catch { /* ignore */ }
    });
  }, [allProgress, dispatch]);

  const serverProgress = readingLibraryResponse?.data.items;
  const progressBooks: LibraryProgressView[] = serverProgress
    ? serverProgress.map((progress) => ({
        bookId: progress.bookId,
        title: progress.Book.title,
        coverUrl: progress.Book.coverUrl,
        category: progress.Book.Category?.name,
        currentPage: progress.currentPage,
        totalPages: progress.totalPages,
        lastReadAt: progress.lastReadAt,
        completedAt: progress.completedAt,
        bookmarkCount: progress.bookmarkCount,
        noteCount: progress.noteCount,
        timeSpentSeconds:
          allProgress[progress.bookId]?.timeSpentSeconds ?? 0,
        authors: progress.Book.Authors?.map((author) => author.name) ?? [],
        publisher: progress.Book.Publisher?.name,
        publicationYear: progress.Book.publicationYear,
        isbn: progress.Book.isbn,
      }))
    : isReadingLibraryError
      ? Object.values(allProgress).map((progress) => ({
          bookId: progress.bookId,
          title: progress.title ?? `Book #${progress.bookId}`,
          coverUrl: progress.coverUrl,
          currentPage: progress.currentPage,
          totalPages: progress.totalPages,
          lastReadAt: progress.lastReadAt,
          completedAt: progress.completedAt ?? null,
          bookmarkCount: 0,
          noteCount: 0,
          timeSpentSeconds: progress.timeSpentSeconds,
          authors: [],
        }))
      : [];

  // Server progress is authoritative; local progress remains an offline fallback.
  const readingBooks = progressBooks.filter(
    (progress) =>
      !progress.completedAt &&
      progress.currentPage > 0 &&
      progress.currentPage < progress.totalPages
  );
  const completedBooks = progressBooks.filter(
    (progress) =>
      Boolean(progress.completedAt) ||
      (progress.currentPage >= progress.totalPages && progress.totalPages > 0)
  );
  const totalReadingTime = Object.values(allProgress).reduce(
    (sum, p) => sum + p.timeSpentSeconds,
    0
  );

  // Filter favorites by search
  const filteredFavorites = favorites.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredHistory = recentlyViewed.filter((h) =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter reading and completed books by search
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredReading = readingBooks.filter((progress) =>
    progress.title.toLowerCase().includes(normalizedSearch)
  );
  const filteredCompleted = completedBooks.filter((progress) =>
    progress.title.toLowerCase().includes(normalizedSearch)
  );

  // Format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#20659C]" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Page Header ── */}
        <div className="mb-8 opacity-0 animate-[heroReveal_0.5s_ease_0.1s_forwards]">
          <nav className="flex items-center gap-1.5 text-sm text-[#9CA3AF] mb-4">
            <Link
              href="/"
              className="hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1A1A1A] dark:text-white font-medium">
              My Library
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#20659C]/10 dark:bg-[#20659C]/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#20659C]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-white">
                My Library
              </h1>
              <p className="text-sm text-[#5E5E5E] dark:text-gray-400">
                Track your reading progress and saved books
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 opacity-0 animate-[heroReveal_0.5s_ease_0.2s_forwards]">
          <StatCard
            icon={Heart}
            label="Saved Books"
            value={favorites.length}
            accent="bg-red-50 dark:bg-red-900/20 text-red-500"
          />
          <StatCard
            icon={BookMarked}
            label="Currently Reading"
            value={readingBooks.length}
            accent="bg-blue-50 dark:bg-blue-900/20 text-[#20659C]"
          />
          <StatCard
            icon={TrendingUp}
            label="Completed"
            value={completedBooks.length}
            accent="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500"
          />
          <StatCard
            icon={Clock}
            label="Time Reading"
            value={formatTime(totalReadingTime)}
            accent="bg-amber-50 dark:bg-amber-900/20 text-[#DF900A]"
          />
        </div>

        {/* ── Tabs + Search ── */}
        <div className="flex flex-col gap-3 mb-6 opacity-0 animate-[heroReveal_0.5s_ease_0.3s_forwards]">
          {/* Tabs row — scrollable on mobile */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-[#E2E8F0]/60 dark:border-gray-800/60 overflow-x-auto scrollbar-none min-w-0">
              <TabButton
                id="favorites"
                active={activeTab === "favorites"}
                label="Saved"
                icon={Heart}
                count={favorites.length}
                onClick={setActiveTab}
              />
              <TabButton
                id="reading"
                active={activeTab === "reading"}
                label="Reading"
                icon={BookMarked}
                count={readingBooks.length}
                onClick={setActiveTab}
              />
              <TabButton
                id="completed"
                active={activeTab === "completed"}
                label="Completed"
                icon={CheckCircle2}
                count={completedBooks.length}
                onClick={setActiveTab}
              />
              <TabButton
                id="history"
                active={activeTab === "history"}
                label="History"
                icon={Clock}
                count={recentlyViewed.length}
                onClick={setActiveTab}
              />
            </div>
          </div>

          {/* Search — full width on all screens */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-[#1A1A1A] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#20659C]/30 focus:border-[#20659C] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="opacity-0 animate-[heroReveal_0.5s_ease_0.35s_forwards]">
          {/* ════ Favorites Tab ════ */}
          {activeTab === "favorites" && (
            <>
              {filteredFavorites.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title={
                    searchQuery
                      ? "No matching saved books"
                      : "No saved books yet"
                  }
                  description={
                    searchQuery
                      ? "Try a different search term."
                      : "Tap the heart icon on any book to save it to your library."
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFavorites.map((fav: FavoriteBook, i: number) => (
                    <div
                      key={fav.id}
                      className="group relative opacity-0 animate-[heroReveal_0.5s_ease_forwards]"
                      style={{ animationDelay: `${0.05 * i}s` }}
                    >
                      <Link href={`/books/${fav.id}`}>
                        <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-[#E2E8F0]/60 dark:border-gray-800/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                          <div className="aspect-[3/4] overflow-hidden relative">
                            <BookCover
                              bookId={fav.id}
                              title={fav.title}
                              className="transition-transform duration-500 group-hover:scale-105"
                            />
                            {fav.category && (
                              <Badge className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[#20659C] border-0 text-[10px] px-2 py-0.5 shadow-sm">
                                {fav.category}
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white line-clamp-2 leading-snug group-hover:text-[#20659C] transition-colors">
                              {fav.title}
                            </h4>
                            <p className="text-[10px] text-[#9CA3AF] mt-1">
                              Saved {formatDate(fav.addedAt)}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(removeFavorite(fav.id));
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════ Currently Reading Tab ════ */}
          {activeTab === "reading" && (
            <>
              {isReadingLibraryLoading ? (
                <div className="flex min-h-52 items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-[#20659C]" />
                </div>
              ) : filteredReading.length === 0 ? (
                <EmptyState
                  icon={BookMarked}
                  title={
                    searchQuery
                      ? "No matching books"
                      : "Not reading anything yet"
                  }
                  description={
                    searchQuery
                      ? "Try a different search term."
                      : "Start reading a book and your progress will appear here."
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredReading.map((progress, index) => (
                    <ProgressBookCard
                      key={progress.bookId}
                      progress={progress}
                      animationDelay={`${0.05 * index}s`}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════ Completed Tab ════ */}
          {activeTab === "completed" && (
            <>
              {isReadingLibraryLoading ? (
                <div className="flex min-h-52 items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-[#20659C]" />
                </div>
              ) : filteredCompleted.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title={
                    searchQuery
                      ? "No matching completed books"
                      : "No completed books yet"
                  }
                  description={
                    searchQuery
                      ? "Try a different search term."
                      : "When you read a book to the last page, it will be marked as completed here."
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredCompleted.map((progress, index) => (
                    <ProgressBookCard
                      key={progress.bookId}
                      progress={progress}
                      animationDelay={`${0.05 * index}s`}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════ History Tab ════ */}
          {activeTab === "history" && (
            <>
              {filteredHistory.length === 0 ? (
                <EmptyState
                  icon={Eye}
                  title={
                    searchQuery
                      ? "No matching books in history"
                      : "No reading history yet"
                  }
                  description={
                    searchQuery
                      ? "Try a different search term."
                      : "Books you view will show up here."
                  }
                />
              ) : (
                <div className="space-y-2">
                  {filteredHistory.map(
                    (entry: ReadingHistoryEntry, i: number) => (
                      <Link
                        href={`/books/${entry.bookId}`}
                        key={`${entry.bookId}-${i}`}
                        className="block opacity-0 animate-[heroReveal_0.5s_ease_forwards]"
                        style={{ animationDelay: `${0.03 * i}s` }}
                      >
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          {/* Mini cover */}
                          <div className="w-10 h-[52px] rounded-lg overflow-hidden shrink-0 shadow-sm">
                            <BookCover
                              bookId={entry.bookId}
                              title={entry.title}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#1A1A1A] dark:text-white line-clamp-1">
                              {entry.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {entry.category && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-[#E2E8F0] dark:border-gray-700 text-[#9CA3AF]"
                                >
                                  {entry.category}
                                </Badge>
                              )}
                              <span className="text-[10px] text-[#9CA3AF]">
                                {formatDate(entry.readAt)}
                              </span>
                            </div>
                          </div>
                          <Eye className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
