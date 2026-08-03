"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { openReadingPreferences } from "@/lib/preference-events";
import { cn } from "@/lib/utils";
import {
  useGetReadingPreferencesQuery,
  useGetRecommendationsQuery,
} from "@/store/api/preferenceApi";
import type { RecommendedBook } from "@/types";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";

function RecommendationCover({ book }: { book: RecommendedBook }) {
  const [hasError, setHasError] = useState(false);

  if (!book.coverUrl || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#123F64] to-[#55B9EA]">
        <BookOpen className="size-12 text-white/60" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/books/${book.id}/cover?v=${encodeURIComponent(book.updatedAt || "")}`}
      alt={book.title}
      onError={() => setHasError(true)}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

function RecommendationSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function SelectedForYou() {
  const t = useTranslations("Recommendations");
  const { isAuthenticated } = useAuth();
  const { data: preferenceResponse, isLoading: isPreferenceLoading } =
    useGetReadingPreferencesQuery(undefined, { skip: !isAuthenticated });
  const isReady = preferenceResponse?.data?.onboardingCompleted === true;
  const { data, isLoading, isError } = useGetRecommendationsQuery(
    { page: 1, limit: 6 },
    { skip: !isAuthenticated || !isReady },
  );

  if (!isAuthenticated || isPreferenceLoading || !isReady) return null;

  const recommendations = data?.data?.books ?? [];
  const reason = data?.data?.reason;

  return (
    <section className="relative overflow-hidden bg-white py-12 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(85,185,234,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(223,144,10,0.08),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#20659C]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#20659C] dark:bg-sky-400/10 dark:text-sky-300">
              <Sparkles className="size-3.5" /> {t("eyebrow")}
            </div>
            <h2 className="font-khmer text-3xl font-extrabold leading-relaxed text-slate-950 sm:text-4xl dark:text-white">
              {t("title")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
              {t("description")}
            </p>
            {reason && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                {[reason.department, ...reason.purposes.slice(0, 2), ...reason.categories.slice(0, 2)].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-900/70"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={openReadingPreferences}
            className="shrink-0 gap-2 rounded-xl"
          >
            <Settings2 className="size-4" /> {t("edit")}
          </Button>
        </div>

        {isError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-8 text-center text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {t("loadError")}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <RecommendationSkeleton key={index} />
                ))
              : recommendations.map((book, index) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#20659C]/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-400/30"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <RecommendationCover book={book} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#20659C] shadow-sm backdrop-blur dark:bg-slate-900/90 dark:text-sky-300">
                        {t("match", { number: index + 1 })}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
                        <span className="truncate text-xs font-semibold">
                          {book.Category?.name ?? t("general")}
                        </span>
                        <span className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold backdrop-blur">
                          {t("score", { score: book.recommendationScore })}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-950 transition-colors group-hover:text-[#20659C] dark:text-white dark:group-hover:text-sky-300">
                        {book.title}
                      </h3>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {book.Authors?.map((author) => author.name).join(", ") ||
                          t("unknownAuthor")}
                      </p>
                      {book.averageRating ? (
                        <StarRating
                          value={Number(book.averageRating)}
                          readOnly
                          size="xs"
                          showValue
                          count={book.reviewCount ?? 0}
                          className="mt-2"
                        />
                      ) : null}
                      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {t("recommendedBecause")}
                        </p>
                        {book.recommendationReasons.slice(0, 2).map((reasonItem) => (
                          <p
                            key={reasonItem}
                            className={cn(
                              "flex items-start gap-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300",
                              reasonItem === "Already completed" && "text-slate-400 line-through",
                            )}
                          >
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                            {reasonItem}
                          </p>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        )}

        {!isLoading && recommendations.length > 0 && (
          <div className="mt-7 flex justify-center">
            <Button asChild variant="outline" className="gap-2 rounded-xl">
              <Link href="/books">
                {t("explore")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
