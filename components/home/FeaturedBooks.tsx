"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Eye,
  Download,
  TrendingUp,
  Sparkles,
  FileText,
  Calendar,
  Video,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetBooksQuery } from "@/store/api/booksApi";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/ui/star-rating";

/* ── Cover with fallback ──────────────────────────────────────────────────── */
function BookCover({
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
    <div className="w-full h-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] flex items-center justify-center">
      <BookOpen className="w-16 h-16 text-white/50" />
    </div>
  );
}

/* ── Skeleton  */
function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden opacity-0 animate-[heroReveal_0.5s_ease_forwards]"
      style={{ animationDelay: `${0.08 * index}s` }}
    >
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60 rounded-2xl overflow-hidden">
        <div className="h-52 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
        </div>
        <div className="p-5 space-y-3">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="flex gap-3 mt-3">
            <div className="h-3 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-3 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Rank badge ───────────────────────────────────────────────────────────── */
const rankBadges = [
  { label: "#1 Most Read", bg: "bg-gradient-to-r from-amber-400 to-amber-500", glow: "shadow-amber-400/30" },
  { label: "#2 Trending", bg: "bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600", glow: "shadow-slate-400/20" },
  { label: "#3 Popular", bg: "bg-gradient-to-r from-orange-400 to-orange-500", glow: "shadow-orange-400/20" },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function FeaturedBooks() {
  const { data, isLoading } = useGetBooksQuery({
    limit: 15,
    sortBy: "views",
    sortOrder: "DESC",
  });
  const books: Book[] = data?.data?.books ?? [];

  return (
    <section className="py-10 bg-[#F8FAFC] dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #20659C 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="opacity-0 animate-[heroReveal_0.5s_ease_0.1s_forwards]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DF900A]/10 dark:bg-[#DF900A]/20 text-[#DF900A] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Curated for You
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">
              Featured Books
            </h2>
            <p className="mt-2 text-[#5E5E5E] dark:text-gray-400 max-w-md text-base">
              Hand-picked titles across every discipline at Norton University.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="shrink-0 gap-2 rounded-xl border-[#20659C]/20 hover:border-[#20659C]/40 hover:bg-[#20659C]/5 dark:border-gray-700 dark:hover:border-[#55B9EA]/40 dark:hover:bg-[#55B9EA]/5 opacity-0 animate-[heroReveal_0.5s_ease_0.2s_forwards]"
          >
            <Link href="/books">
              View All Books <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* ── Book Grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))
            : books.map((book, index) => (
                <Link
                  href={`/books/${book.id}`}
                  key={book.id}
                  className="group block opacity-0 animate-[heroReveal_0.5s_ease_forwards]"
                  style={{ animationDelay: `${0.1 + 0.08 * index}s` }}
                >
                  {/* Hover glow underlay */}
                  <div className="relative h-full">
                    <div className="absolute -inset-px bg-gradient-to-b from-[#20659C]/20 to-[#55B9EA]/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />

                    <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60 rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5 group-hover:border-[#20659C]/20 dark:group-hover:border-[#55B9EA]/20 h-full flex flex-col">
                      {/* ── Cover ── */}
                      <div className="relative h-52 overflow-hidden shrink-0">
                        <BookCover
                          coverUrl={
                            book.coverUrl
                              ? `/api/books/${book.id}/cover`
                              : null
                          }
                          title={book.title}
                          className="transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                        {/* Rank badge (top 3) */}
                        {index < 3 && (
                          <div className="absolute top-3 left-3 z-10">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-lg",
                                rankBadges[index].bg,
                                rankBadges[index].glow
                              )}
                            >
                              <TrendingUp className="w-3 h-3" />
                              {rankBadges[index].label}
                            </span>
                          </div>
                        )}

                        {/* Stats pills (bottom of cover) */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                          <div className="flex items-center gap-1.5">
                            {(book.views ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-full">
                                <Eye className="w-3 h-3" />
                                {(book.views ?? 0).toLocaleString()}
                              </span>
                            )}
                            {(book.downloads ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-full">
                                <Download className="w-3 h-3" />
                                {(book.downloads ?? 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {book.pdfUrl && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full" title="PDF Available">
                                <FileText className="w-3 h-3" />
                                PDF
                              </span>
                            )}
                            {(book.videoUrl || (book as any).video_url) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full" title="Video Available">
                                <Video className="w-3 h-3" />
                                Video
                              </span>
                            )}
                            {(book.audioUrl || (book as any).audio_url) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full" title="Audio Available">
                                <Headphones className="w-3 h-3" />
                                Audio
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Info ── */}
                      <div className="p-5 flex flex-col flex-1">
                        {/* Category + Year row */}
                        <div className="flex items-center gap-2 mb-2.5">
                          {book.Category && (
                            <Badge className="bg-[#20659C]/8 dark:bg-[#20659C]/15 text-[#20659C] dark:text-[#55B9EA] border-0 text-[10px] font-semibold px-2 py-0.5 hover:bg-[#20659C]/12">
                              {book.Category.name}
                            </Badge>
                          )}
                          {book.publicationYear && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#9CA3AF] font-medium">
                              <Calendar className="w-3 h-3" />
                              {book.publicationYear}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-[#1A1A1A] dark:text-white leading-snug line-clamp-2 group-hover:text-[#20659C] dark:group-hover:text-[#55B9EA] transition-colors text-[15px]">
                          {book.title}
                        </h3>

                        {/* Author */}
                        {book.Authors && book.Authors.length > 0 && (
                          <p className="text-sm text-[#5E5E5E] dark:text-gray-400 mt-1.5 line-clamp-1">
                            {book.Authors.map((a) => a.name).join(", ")}
                          </p>
                        )}

                        {/* Star Rating */}
                        {(book.averageRating || book.reviewCount) ? (
                          <StarRating
                            value={Number(book.averageRating) || 0}
                            readOnly
                            size="xs"
                            showValue
                            count={Number(book.reviewCount) || 0}
                            className="mt-2"
                          />
                        ) : null}

                        {/* Bottom stat bar */}
                        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[#E2E8F0]/60 dark:border-gray-800/60">
                          {book.pages && (
                            <span className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              {book.pages} pages
                            </span>
                          )}
                          <span className="text-xs text-[#20659C] dark:text-[#55B9EA] font-semibold ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            Read more <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
