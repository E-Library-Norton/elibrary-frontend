"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  BookOpen,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  AlertCircle,
  Loader2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBooks } from "@/hooks/useBooks";
import { useGetCategoriesQuery } from "@/store/api/booksApi";
import { StarRating } from "@/components/ui/star-rating";
import { useAppSelector } from "@/lib/hooks";
import { withBooksReturnHref } from "@/lib/books-navigation";
import { selectIsFavorite } from "@/store/slices/librarySlice";


const LIMIT = 12;

const sortOptions = [
  { value: "created_at", label: "Newest First", order: "DESC" },
  { value: "title", label: "Title A–Z", order: "ASC" },
  { value: "views", label: "Most Viewed", order: "DESC" },
  { value: "review_count", label: "Most Reviewed", order: "DESC" },
  { value: "downloads", label: "Most Downloaded", order: "DESC" },
];

const defaultSort = sortOptions[0];

function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function BookCover({
  coverUrl,
  title,
  className,
  iconSize = "w-12 h-12",
}: {
  coverUrl?: string | null;
  title: string;
  className?: string;
  iconSize?: string;
}) {
  const [imgError, setImgError] = useState(false);
  if (coverUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverUrl}
        alt={title}
        onError={() => setImgError(true)}
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "w-full h-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] flex items-center justify-center",
        className
      )}
    >
      <BookOpen className={cn(iconSize, "text-white/60")} />
    </div>
  );
}

// ── Skeleton card 
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0]/60 dark:border-gray-800/60 overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="h-52 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="flex gap-3 pt-1">
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ── Saved heart badge
function SavedBadge({ bookId }: { bookId: number }) {
  const isSaved = useAppSelector(selectIsFavorite(bookId));
  if (!isSaved) return null;
  return (
    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
    </div>
  );
}

function BooksPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? searchParams.get("name") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const page = parsePage(searchParams.get("page"));
  const view = searchParams.get("view") === "list" ? "list" : "grid";
  const sortOpt =
    sortOptions.find(
      (option) =>
        option.value === searchParams.get("sortBy") &&
        option.order === searchParams.get("sortOrder")
    ) ?? defaultSort;

  const [searchInput, setSearchInput] = useState(search);
  const [showFilter, setShowFilter] = useState(false);

  const pushQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());

      // Normalize links from the home-page search before applying updates.
      const legacySearch = next.get("name");
      if (legacySearch && !next.has("search")) next.set("search", legacySearch);
      next.delete("name");

      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });

      const query = next.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      const currentHref = searchParams.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (href !== currentHref) window.history.pushState(null, "", href);
    },
    [pathname, searchParams]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      pushQuery({ page: nextPage > 1 ? String(nextPage) : null });
    },
    [pushQuery]
  );

  const setCategory = (nextCategoryId: string) => {
    pushQuery({ categoryId: nextCategoryId || null, page: null });
    setShowFilter(false);
  };

  const setSort = (option: (typeof sortOptions)[number]) => {
    const isDefault = option === defaultSort;
    pushQuery({
      sortBy: isDefault ? null : option.value,
      sortOrder: isDefault ? null : option.order,
      page: null,
    });
    setShowFilter(false);
  };

  const listingHref = searchParams.size
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const getBookHref = (bookId: number) =>
    withBooksReturnHref(`/books/${bookId}`, listingHref);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce search
  useEffect(() => {
    if (searchInput === search) return;

    const t = setTimeout(() => {
      pushQuery({ search: searchInput.trim() || null, page: null });
    }, 400);
    return () => clearTimeout(t);
  }, [pushQuery, search, searchInput]);

  const { books, total, totalPages, isLoading, isFetching, isError } = useBooks({
    page,
    limit: LIMIT,
    search: search || undefined,
    categoryId: categoryId || undefined,
    sortBy: sortOpt.value,
    sortOrder: sortOpt.order as "ASC" | "DESC",
  });

  const { data: catData } = useGetCategoriesQuery();
  const categories = catData?.data ?? [];

  const clearFilters = () => {
    setSearchInput("");
    pushQuery({
      search: null,
      categoryId: null,
      sortBy: null,
      sortOrder: null,
      page: null,
    });
  };

  const hasFilters = !!search || !!categoryId || sortOpt !== defaultSort;

  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0d3a61] via-[#174c78] to-[#20659C] py-20 sm:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#55B9EA]/8 blur-[120px] animate-[hero-glow_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#DF900A]/6 blur-[100px] animate-[hero-glow_10s_ease-in-out_infinite_2s]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-6 opacity-0 animate-[heroReveal_0.8s_ease_0.1s_forwards]">
            <div className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] rounded-full px-4 py-1.5 text-sm font-medium text-white/90">
              <BookOpen className="w-3.5 h-3.5 text-[#DF900A]" />
              Academic Collection
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-4 opacity-0 animate-[heroReveal_0.8s_ease_0.2s_forwards]">
            Browse Our{" "}
            <span className="bg-gradient-to-r from-[#55B9EA] via-[#7ecbf2] to-[#55B9EA] bg-clip-text text-transparent bg-[length:200%_auto] animate-[hero-gradient_4s_ease-in-out_infinite]">
              Library
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/55 max-w-xl mx-auto mb-8 opacity-0 animate-[heroReveal_0.8s_ease_0.35s_forwards]">
            Explore our collection of academic books, journals, and resources.
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto opacity-0 animate-[heroReveal_0.8s_ease_0.5s_forwards]">
            <div className="group flex gap-2 bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-2xl p-1.5 transition-all duration-300 hover:bg-white/[0.12] hover:border-white/[0.18] focus-within:bg-white/[0.12] focus-within:border-white/[0.2] focus-within:shadow-lg focus-within:shadow-[#55B9EA]/10">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      pushQuery({ search: searchInput.trim() || null, page: null });
                    }
                  }}
                  placeholder="Search title, author, ISBN..."
                  className="pl-10 h-11 bg-transparent text-white placeholder:text-white/35 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                size="lg"
                className="bg-[#DF900A] hover:bg-[#E3A13C] text-white rounded-xl px-6 h-11 font-semibold shadow-lg shadow-[#DF900A]/20 hover:shadow-[#DF900A]/30 transition-all duration-300 hover:scale-[1.02]"
                onClick={() => pushQuery({ search: searchInput.trim() || null, page: null })}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full">
            <path d="M0 40 L0 20 Q360 0 720 20 Q1080 40 1440 20 L1440 40 Z" className="fill-[#F8FAFC] dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      <section className="py-10 bg-[#F8FAFC] dark:bg-gray-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Sidebar ── */}
            {showFilter && (
              <button
                type="button"
                aria-label="Close filters"
                className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
                onClick={() => setShowFilter(false)}
              />
            )}
            <aside
              className={cn(
                "lg:w-56 shrink-0 space-y-4",
                showFilter
                  ? "fixed left-4 right-4 top-20 z-50 block max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-[#E2E8F0]/70 bg-[#F8FAFC]/95 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/95 lg:static lg:max-h-none lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
                  : "hidden lg:block"
              )}
            >
              <div className="mb-2 flex items-center justify-between px-1 lg:hidden">
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">Filters</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowFilter(false)}
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {/* Categories */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-[#E2E8F0]/60 dark:border-gray-800/60 p-5 shadow-sm">
                <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-4 text-sm flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[#20659C]" />
                  Categories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setCategory("")}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        !categoryId
                          ? "bg-[#20659C] text-white font-semibold"
                          : "text-[#5E5E5E] dark:text-gray-400 hover:bg-[#20659C]/10 hover:text-[#20659C]"
                      )}
                    >
                      All
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setCategory(String(cat.id))}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          categoryId === String(cat.id)
                            ? "bg-[#20659C] text-white font-semibold"
                            : "text-[#5E5E5E] dark:text-gray-400 hover:bg-[#20659C]/10 hover:text-[#20659C]"
                        )}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-[#E2E8F0]/60 dark:border-gray-800/60 p-5 shadow-sm">
                <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-4 text-sm flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[#DF900A]" />
                  Sort By
                </h3>
                <div className="space-y-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value + opt.order}
                      onClick={() => setSort(opt)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        sortOpt === opt
                          ? "bg-[#DF900A]/10 text-[#DF900A] font-semibold"
                          : "text-[#5E5E5E] dark:text-gray-400 hover:bg-[#DF900A]/5"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden gap-1.5"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    {showFilter ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                    {showFilter ? "Hide" : "Filters"}
                  </Button>

                  {isLoading ? (
                    <span className="text-sm text-[#9CA3AF]">Loading…</span>
                  ) : (
                    <span className="text-sm text-[#5E5E5E] dark:text-gray-400">
                      <span className="font-semibold text-[#1A1A1A] dark:text-white">{total}</span>{" "}
                      book{total !== 1 ? "s" : ""} found
                    </span>
                  )}

                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-red-500 hover:text-red-600 gap-1 h-7 px-2"
                    >
                      <X className="w-3 h-3" /> Clear
                    </Button>
                  )}

                  {categoryId && categories.find((c) => String(c.id) === categoryId) && (
                    <Badge variant="default" className="gap-1 cursor-pointer" onClick={() => setCategory("")}>
                      {categories.find((c) => String(c.id) === categoryId)?.name}
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => pushQuery({ view: null })}
                    className={cn("p-1.5 rounded-md transition-colors", view === "grid" ? "bg-[#20659C] text-white" : "text-[#5E5E5E] hover:text-[#20659C]")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => pushQuery({ view: "list" })}
                    className={cn("p-1.5 rounded-md transition-colors", view === "list" ? "bg-[#20659C] text-white" : "text-[#5E5E5E] hover:text-[#20659C]")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error */}
              {isError && !isLoading && (
                <div className="flex items-center gap-3 p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">Failed to load books. Please check your connection.</p>
                </div>
              )}

              {/* Background refresh indicator */}
              {isFetching && !isLoading && (
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-3">
                  <Loader2 className="w-3 h-3 animate-spin" /> Updating…
                </div>
              )}

              {/* Loading skeletons */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen className="w-16 h-16 text-[#9CA3AF] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-2">No books found</h3>
                  <p className="text-[#5E5E5E] dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
              ) : view === "grid" ? (
                /* ── Grid view ── */
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {books.map((book, idx) => (
                    <Link href={getBookHref(book.id)} key={book.id} className="group opacity-0 animate-[heroReveal_0.5s_ease_forwards]" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="relative h-full">
                        {/* Hover glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#20659C] to-[#55B9EA] rounded-2xl opacity-0 group-hover:opacity-30 blur-md transition-all duration-500" />
                        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-[#E2E8F0]/60 dark:border-gray-800/60 h-full transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl">
                          {/* Cover image */}
                          <div className="relative h-52 overflow-hidden">
                            <BookCover coverUrl={book.coverUrl ? `/api/books/${book.id}/cover?v=${encodeURIComponent(book.updatedAt || '')}` : null} title={book.title} iconSize="w-14 h-14" className="transition-transform duration-700 group-hover:scale-110" />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {/* Category badge on image */}
                            {book.Category && (
                              <div className="absolute top-3 left-3">
                                <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[#20659C] dark:text-[#55B9EA] px-2.5 py-1 rounded-full border border-[#20659C]/10 dark:border-[#55B9EA]/20 shadow-sm">
                                  {book.Category.name}
                                </span>
                              </div>
                            )}
                            {/* Saved heart badge */}
                            <SavedBadge bookId={book.id} />
                            {/* Stats pills */}
                            <div className="absolute bottom-3 right-3 flex gap-1.5">
                              {(book.views ?? 0) > 0 && (
                                <span className="flex items-center gap-1 text-[10px] font-medium bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[#5E5E5E] dark:text-gray-300 px-2 py-1 rounded-full shadow-sm border border-white/20">
                                  <Eye className="w-3 h-3 text-[#20659C]" />{book.views}
                                </span>
                              )}
                              {(book.downloads ?? 0) > 0 && (
                                <span className="flex items-center gap-1 text-[10px] font-medium bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[#5E5E5E] dark:text-gray-300 px-2 py-1 rounded-full shadow-sm border border-white/20">
                                  <Download className="w-3 h-3 text-[#DF900A]" />{book.downloads}
                                </span>
                              )}
                            </div>
                            {/* Hover shimmer */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                          </div>
                          {/* Content */}
                          <CardContent className="p-5">
                            <h3 className="font-bold text-[#1A1A1A] dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-[#20659C] transition-colors duration-300 mb-1.5">
                              {book.title}
                            </h3>
                            {(book.averageRating || book.reviewCount) ? (
                              <StarRating
                                value={Number(book.averageRating) || 0}
                                readOnly
                                size="xs"
                                showValue
                                count={Number(book.reviewCount) || 0}
                                className="mb-1.5"
                              />
                            ) : null}
                            <div className="flex items-center gap-2 text-xs text-[#5E5E5E] dark:text-gray-400">
                              {book.Authors && book.Authors.length > 0 && (
                                <span className="line-clamp-1">{book.Authors.map((a) => a.name).join(", ")}</span>
                              )}
                              {book.Authors && book.Authors.length > 0 && book.publicationYear && (
                                <span className="w-1 h-1 rounded-full bg-[#9CA3AF] shrink-0" />
                              )}
                              {book.publicationYear && (
                                <span className="text-[#9CA3AF] shrink-0">{book.publicationYear}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* ── List view ── */
                <div className="space-y-3">
                  {books.map((book, idx) => (
                    <Link href={getBookHref(book.id)} key={book.id} className="group block opacity-0 animate-[heroReveal_0.4s_ease_forwards]" style={{ animationDelay: `${idx * 0.04}s` }}>
                      <div className="relative">
                        {/* Hover glow */}
                        <div className="absolute -inset-px bg-gradient-to-r from-[#20659C] to-[#55B9EA] rounded-2xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500" />
                        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-[#E2E8F0]/60 dark:border-gray-800/60 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5">
                          <CardContent className="p-4 sm:p-5 flex gap-4 sm:gap-5 items-center">
                            {/* Cover thumbnail */}
                            <div className="w-16 h-22 sm:w-18 sm:h-24 rounded-xl overflow-hidden shrink-0 shadow-md ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-500 group-hover:scale-105">
                              <BookCover coverUrl={book.coverUrl ? `/api/books/${book.id}/cover?v=${encodeURIComponent(book.updatedAt || '')}` : null} title={book.title} iconSize="w-7 h-7" />
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                {book.Category && (
                                  <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider bg-[#20659C]/8 dark:bg-[#20659C]/15 text-[#20659C] dark:text-[#55B9EA] px-2 py-0.5 rounded-full border border-[#20659C]/10 dark:border-[#55B9EA]/20">
                                    {book.Category.name}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-[#1A1A1A] dark:text-white text-sm sm:text-base group-hover:text-[#20659C] transition-colors duration-300 truncate">
                                {book.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-gray-400 mt-1">
                                {book.Authors?.map((a) => a.name).join(", ") ?? "—"}
                                {book.publicationYear && (
                                  <>
                                    <span className="inline-block w-1 h-1 rounded-full bg-[#9CA3AF] mx-2 align-middle" />
                                    <span className="text-[#9CA3AF]">{book.publicationYear}</span>
                                  </>
                                )}
                              </p>
                              {(book.averageRating || book.reviewCount) ? (
                                <StarRating
                                  value={Number(book.averageRating) || 0}
                                  readOnly
                                  size="xs"
                                  showValue
                                  count={Number(book.reviewCount) || 0}
                                  className="mt-1.5"
                                />
                              ) : null}
                              <div className="flex items-center gap-3 mt-2">
                                {(book.views ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                    <Eye className="w-3.5 h-3.5 text-[#20659C]/60" />{book.views}
                                  </span>
                                )}
                                {(book.downloads ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                    <Download className="w-3.5 h-3.5 text-[#DF900A]/60" />{book.downloads}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Arrow indicator */}
                            <div className="shrink-0 flex items-center gap-2">
                              <SavedBadge bookId={book.id} />
                              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#20659C]/5 dark:bg-[#20659C]/10 text-[#20659C]/40 group-hover:text-[#20659C] group-hover:bg-[#20659C]/10 transition-all duration-300">
                                <SlidersHorizontal className="w-4 h-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-[#9CA3AF]">…</span>
                      ) : (
                        <Button
                          key={item}
                          variant={page === item ? "default" : "outline"}
                          size="sm"
                          className="w-9 h-9 p-0"
                          onClick={() => setPage(item as number)}
                        >
                          {item}
                        </Button>
                      )
                    )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-gray-950">
          <Loader2 className="h-8 w-8 animate-spin text-[#20659C]" aria-label="Loading books" />
        </div>
      }
    >
      <BooksPageContent />
    </Suspense>
  );
}
