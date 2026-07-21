"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Headphones,
  Grid3X3,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Music,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBooks } from "@/hooks/useBooks";
import { useGetCategoriesQuery } from "@/store/api/booksApi";
import { StarRating } from "@/components/ui/star-rating";

const LIMIT = 12;

const sortOptions = [
  { value: "created_at", label: "Newest First", order: "DESC" },
  { value: "title", label: "Title A–Z", order: "ASC" },
  { value: "views", label: "Most Viewed", order: "DESC" },
  { value: "review_count", label: "Most Reviewed", order: "DESC" },
  { value: "downloads", label: "Most Downloaded", order: "DESC" },
];

// ── Cover
function AudioCover({
  coverUrl,
  title,
  className,
}: {
  coverUrl?: string | null;
  title: string;
  className?: string;
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
    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
      <Headphones className="w-14 h-14 text-white/40" />
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-amber-100/60 dark:border-gray-800/60 overflow-hidden bg-white/80 dark:bg-gray-900/80">
      <div className="h-52 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function AudiosPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilter, setShowFilter] = useState(false);
  const [sortOpt, setSortOpt] = useState(sortOptions[0]);
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { books, total, totalPages, isLoading, isFetching, isError } = useBooks({
    page,
    limit: LIMIT,
    hasAudio: "true",
    search: search || undefined,
    categoryId: categoryId || undefined,
    sortBy: sortOpt.value,
    sortOrder: sortOpt.order as "ASC" | "DESC",
  });

  // Client-side safety: only show books that genuinely have an audioUrl
  const filtered = books.filter((b) => b.audioUrl);

  const { data: catData } = useGetCategoriesQuery();
  const categories = catData?.data ?? [];

  const clearFilters = () => {
    setSearchInput(""); setSearch(""); setCategoryId(""); setSortOpt(sortOptions[0]); setPage(1);
  };
  const hasFilters = !!search || !!categoryId || sortOpt !== sortOptions[0];

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 py-20 sm:py-24">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber-400/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-orange-400/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] rounded-full px-4 py-1.5 text-sm font-medium text-white/90">
              <Headphones className="w-3.5 h-3.5 text-amber-300" />
              Audio Library
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-4">
            Listen &{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              Learn
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/55 max-w-xl mx-auto mb-8">
            Audiobooks and narration for learning on the go.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto">
            <div className="flex gap-2 bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-2xl p-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                  placeholder="Search audiobooks…"
                  className="pl-10 h-11 bg-transparent text-white placeholder:text-white/35 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-6 h-11 font-semibold"
                onClick={() => { setSearch(searchInput); setPage(1); }}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full">
            <path d="M0 40 L0 20 Q360 0 720 20 Q1080 40 1440 20 L1440 40 Z" className="fill-[#F8FAFC] dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ── Content ── */}
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
                  ? "fixed left-4 right-4 top-20 z-50 block max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-amber-100/70 bg-[#F8FAFC]/95 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/95 lg:static lg:max-h-none lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
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
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-100/60 dark:border-gray-800/60 p-5 shadow-sm">
                <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-4 text-sm flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-amber-600" />
                  Categories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => { setCategoryId(""); setPage(1); setShowFilter(false); }}
                      className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        !categoryId ? "bg-amber-600 text-white font-semibold" : "text-[#5E5E5E] dark:text-gray-400 hover:bg-amber-600/10 hover:text-amber-700"
                      )}
                    >All</button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => { setCategoryId(String(cat.id)); setPage(1); setShowFilter(false); }}
                        className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          categoryId === String(cat.id) ? "bg-amber-600 text-white font-semibold" : "text-[#5E5E5E] dark:text-gray-400 hover:bg-amber-600/10 hover:text-amber-700"
                        )}
                      >{cat.name}</button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-100/60 dark:border-gray-800/60 p-5 shadow-sm">
                <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-4 text-sm flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-orange-500" />
                  Sort By
                </h3>
                <div className="space-y-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value + opt.order}
                      onClick={() => { setSortOpt(opt); setPage(1); setShowFilter(false); }}
                      className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        sortOpt === opt ? "bg-amber-600/10 text-amber-700 dark:text-amber-300 font-semibold" : "text-[#5E5E5E] dark:text-gray-400 hover:bg-amber-600/5"
                      )}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="lg:hidden gap-1.5" onClick={() => setShowFilter(!showFilter)}>
                    {showFilter ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                    {showFilter ? "Hide" : "Filters"}
                  </Button>

                  {isLoading ? (
                    <span className="text-sm text-[#9CA3AF]">Loading…</span>
                  ) : (
                    <span className="text-sm text-[#5E5E5E] dark:text-gray-400">
                      <span className="font-semibold text-[#1A1A1A] dark:text-white">{total}</span> audiobook{total !== 1 ? "s" : ""} found
                    </span>
                  )}

                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 gap-1 h-7 px-2">
                      <X className="w-3 h-3" /> Clear
                    </Button>
                  )}
                  {categoryId && categories.find((c) => String(c.id) === categoryId) && (
                    <Badge variant="default" className="gap-1 cursor-pointer bg-amber-600 hover:bg-amber-700" onClick={() => { setCategoryId(""); setPage(1); }}>
                      {categories.find((c) => String(c.id) === categoryId)?.name}
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-100/60 dark:border-gray-800/60 rounded-xl p-1 shadow-sm">
                  <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-md transition-colors", view === "grid" ? "bg-amber-600 text-white" : "text-[#5E5E5E] hover:text-amber-700")}>
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setView("list")} className={cn("p-1.5 rounded-md transition-colors", view === "list" ? "bg-amber-600 text-white" : "text-[#5E5E5E] hover:text-amber-700")}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isError && !isLoading && (
                <div className="flex items-center gap-3 p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">Failed to load audiobooks. Please check your connection.</p>
                </div>
              )}

              {isFetching && !isLoading && (
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-3">
                  <Loader2 className="w-3 h-3 animate-spin" /> Updating…
                </div>
              )}

              {/* Grid / List */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Headphones className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-2">No audiobooks found</h3>
                  <p className="text-[#5E5E5E] dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
              ) : view === "grid" ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((book, idx) => (
                    <Link
                      href={`/books/${book.id}?tab=audio`}
                      key={book.id}
                      className="group block opacity-0 animate-[heroReveal_0.5s_ease_forwards]"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="relative h-full">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-md transition-all duration-500" />
                        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-amber-100/60 dark:border-gray-800/60 h-full transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl">
                          {/* Cover */}
                          <div className="relative h-52 overflow-hidden shrink-0">
                            <AudioCover
                              coverUrl={book.coverUrl ? `/api/books/${book.id}/cover` : null}
                              title={book.title}
                              className="transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Headphones overlay */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            {/* Badge */}
                            <div className="absolute bottom-3 left-3 flex gap-2">
                              <Badge className="bg-amber-600 text-white border-0 text-[10px] font-bold">AUDIO</Badge>
                              {book.Category && (
                                <Badge className="bg-white/90 dark:bg-gray-900/90 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold">
                                  {book.Category.name}
                                </Badge>
                              )}
                            </div>
                            {/* Stats */}
                            <div className="absolute top-3 right-3 flex flex-col gap-1">
                              {(book.views ?? 0) > 0 && (
                                <span className="flex items-center gap-1 text-[10px] font-medium bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[#5E5E5E] dark:text-gray-300 px-2 py-1 rounded-full shadow-sm">
                                  <Eye className="w-3 h-3 text-amber-600" />{book.views}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Info */}
                          <CardContent className="p-5">
                            <h3 className="font-bold text-[#1A1A1A] dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-300 mb-1.5">
                              {book.title}
                            </h3>
                            {(book.averageRating || book.reviewCount) ? (
                              <StarRating value={Number(book.averageRating) || 0} readOnly size="xs" showValue count={Number(book.reviewCount) || 0} className="mb-1.5" />
                            ) : null}
                            <div className="flex items-center gap-2 text-xs text-[#5E5E5E] dark:text-gray-400">
                              {book.Authors && book.Authors.length > 0 && (
                                <span className="line-clamp-1">{book.Authors.map((a) => a.name).join(", ")}</span>
                              )}
                              {book.Authors && book.Authors.length > 0 && book.publicationYear && (
                                <span className="w-1 h-1 rounded-full bg-[#9CA3AF] shrink-0" />
                              )}
                              {book.publicationYear && <span className="text-[#9CA3AF] shrink-0">{book.publicationYear}</span>}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                // List view
                <div className="space-y-3">
                  {filtered.map((book, idx) => (
                    <Link
                      href={`/books/${book.id}?tab=audio`}
                      key={book.id}
                      className="group block opacity-0 animate-[heroReveal_0.4s_ease_forwards]"
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <Card className="overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-amber-100/60 dark:border-gray-800/60 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5">
                        <CardContent className="p-4 sm:p-5 flex gap-4 sm:gap-5 items-center">
                          <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0 shadow-md relative">
                            <AudioCover coverUrl={book.coverUrl ? `/api/books/${book.id}/cover` : null} title={book.title} className="transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <Music className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {book.Category && (
                                <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider bg-amber-600/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                  {book.Category.name}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-[#1A1A1A] dark:text-white text-sm sm:text-base group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-300 truncate">
                              {book.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-gray-400 mt-0.5">
                              {book.Authors?.map((a) => a.name).join(", ") ?? "—"}
                              {book.publicationYear && <span className="ml-2 text-[#9CA3AF]">{book.publicationYear}</span>}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {(book.views ?? 0) > 0 && (
                                <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                  <Eye className="w-3.5 h-3.5 text-amber-500/60" />{book.views}
                                </span>
                              )}
                              {(book.downloads ?? 0) > 0 && (
                                <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                  <Download className="w-3.5 h-3.5 text-orange-500/60" />{book.downloads}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-amber-600/5 dark:bg-amber-600/10 text-amber-600/40 group-hover:text-amber-600 group-hover:bg-amber-600/10 transition-all duration-300">
                            <Headphones className="w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                      acc.push(p); return acc;
                    }, [])
                    .map((item, i) =>
                      item === "…" ? (
                        <span key={`e-${i}`} className="px-1 text-[#9CA3AF]">…</span>
                      ) : (
                        <Button key={item} variant={page === item ? "default" : "outline"} size="sm" className={cn("w-9 h-9 p-0", page === item && "bg-amber-600 hover:bg-amber-700 border-amber-600")} onClick={() => setPage(item as number)}>
                          {item}
                        </Button>
                      )
                    )}
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
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
