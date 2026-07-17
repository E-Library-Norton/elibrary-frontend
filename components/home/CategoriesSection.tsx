"use client";

import React from "react";
import Link from "next/link";
import {
  Monitor,
  Briefcase,
  Cpu,
  Scale,
  Stethoscope,
  FlaskConical,
  GraduationCap,
  Globe,
  BookOpen,
  Palette,
  Languages,
  Landmark,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useGetCategoriesQuery } from "@/store/api/booksApi";
import { cn } from "@/lib/utils";
import type { BookCategory } from "@/types";

/* ── Icon + color map per category name (fallback-safe) ─────────────────── */
const categoryMeta: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; accent: string }
> = {
  "computer science": {
    icon: Monitor,
    color: "text-[#20659C]",
    bg: "bg-[#20659C]/8 dark:bg-[#20659C]/15",
    accent: "from-[#20659C] to-[#55B9EA]",
  },
  business: {
    icon: Briefcase,
    color: "text-[#DF900A]",
    bg: "bg-[#DF900A]/8 dark:bg-[#DF900A]/15",
    accent: "from-[#DF900A] to-[#E3A13C]",
  },
  engineering: {
    icon: Cpu,
    color: "text-[#55B9EA]",
    bg: "bg-[#55B9EA]/10 dark:bg-[#55B9EA]/15",
    accent: "from-[#55B9EA] to-[#89d4f5]",
  },
  law: {
    icon: Scale,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    accent: "from-purple-500 to-purple-400",
  },
  medicine: {
    icon: Stethoscope,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/15",
    accent: "from-red-500 to-rose-400",
  },
  science: {
    icon: FlaskConical,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/15",
    accent: "from-emerald-500 to-green-400",
  },
  education: {
    icon: GraduationCap,
    color: "text-[#E3A13C]",
    bg: "bg-[#E3A13C]/8 dark:bg-[#E3A13C]/15",
    accent: "from-[#E3A13C] to-amber-400",
  },
  "social science": {
    icon: Globe,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/15",
    accent: "from-teal-500 to-cyan-400",
  },
  art: {
    icon: Palette,
    color: "text-pink-500 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-900/15",
    accent: "from-pink-500 to-rose-400",
  },
  language: {
    icon: Languages,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/15",
    accent: "from-indigo-500 to-blue-400",
  },
  history: {
    icon: Landmark,
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/15",
    accent: "from-amber-600 to-yellow-500",
  },
};

const defaultMeta = {
  icon: BookOpen,
  color: "text-[#20659C]",
  bg: "bg-[#20659C]/8 dark:bg-[#20659C]/15",
  accent: "from-[#20659C] to-[#55B9EA]",
};

function getMeta(name: string) {
  const key = name.toLowerCase();
  // Try exact match first, then partial
  if (categoryMeta[key]) return categoryMeta[key];
  const found = Object.keys(categoryMeta).find(
    (k) => key.includes(k) || k.includes(key)
  );
  return found ? categoryMeta[found] : defaultMeta;
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function CategorySkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-2xl border border-[#E2E8F0]/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 opacity-0 animate-[heroReveal_0.5s_ease_forwards]"
      style={{ animationDelay: `${0.06 * index}s` }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function CategoriesSection() {
  const { data, isLoading } = useGetCategoriesQuery();
  const categories: BookCategory[] = data?.data ?? [];

  return (
    <section className="py-10 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#20659C]/[0.03] dark:bg-[#55B9EA]/[0.04] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ── Header ── */}
        <div className="text-center mb-14 opacity-0 animate-[heroReveal_0.5s_ease_0.1s_forwards]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#20659C]/8 dark:bg-[#20659C]/15 text-[#20659C] dark:text-[#55B9EA] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Explore Topics
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">
            Browse by Category
          </h2>
          <p className="mt-3 text-[#5E5E5E] dark:text-gray-400 max-w-lg mx-auto text-base">
            Discover resources across all academic disciplines at Norton
            University.
          </p>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <CategorySkeleton key={i} index={i} />
              ))
            : categories.slice(0, 6).map((cat, i) => {
                const meta = getMeta(cat.name);
                const Icon = meta.icon;

                return (
                  <Link
                    key={cat.id}
                    href={`/books?categoryId=${cat.id}`}
                    className="group block opacity-0 animate-[heroReveal_0.5s_ease_forwards]"
                    style={{ animationDelay: `${0.15 + 0.06 * i}s` }}
                  >
                    <div className="relative h-full">
                      {/* Hover glow */}
                      <div
                        className={cn(
                          "absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 bg-gradient-to-br",
                          meta.accent
                        )}
                        style={{ opacity: 0 }}
                      />
                      <div
                        className={cn(
                          "absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500 bg-gradient-to-br",
                          meta.accent
                        )}
                      />

                      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60 rounded-2xl p-6 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5 group-hover:border-[#20659C]/15 dark:group-hover:border-[#55B9EA]/15 h-full">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
                              meta.bg
                            )}
                          >
                            <Icon className={cn("w-7 h-7", meta.color)} />
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base leading-tight group-hover:text-[#20659C] dark:group-hover:text-[#55B9EA] transition-colors">
                              {cat.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-[#9CA3AF] font-medium">
                                Browse collection
                              </span>
                              <ArrowRight className="w-3 h-3 text-[#9CA3AF] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* ── View all link ── */}
        {categories.length > 8 && (
          <div className="text-center mt-8 opacity-0 animate-[heroReveal_0.5s_ease_0.6s_forwards]">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#20659C] dark:text-[#55B9EA] hover:underline underline-offset-4"
            >
              View all {categories.length} categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
