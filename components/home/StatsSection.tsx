"use client";

import { BookMarked, Users, BookOpen, Globe, TrendingUp } from "lucide-react";
import { useGetStatsQuery } from "@/store/api/booksApi";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}+`;
}

const STAT_CONFIGS = [
  {
    icon: BookOpen,
    key: "total_books" as const,
    label: "Digital Books",
    desc: "Across all faculties",
    color: "text-[#20659C]",
    iconBg: "bg-[#20659C]/8 dark:bg-[#20659C]/15",
    border: "border-[#20659C]/15 dark:border-[#20659C]/20",
    shadow: "hover:shadow-[0_8px_30px_rgba(32,101,156,0.12)]",
    staticValue: null as string | null,
  },
  {
    icon: Users,
    key: "total_members" as const,
    label: "Active Students",
    desc: "Enrolled this year",
    color: "text-[#DF900A]",
    iconBg: "bg-[#DF900A]/8 dark:bg-[#DF900A]/15",
    border: "border-[#DF900A]/15 dark:border-[#DF900A]/20",
    shadow: "hover:shadow-[0_8px_30px_rgba(223,144,10,0.12)]",
    staticValue: null as string | null,
  },
  {
    icon: BookMarked,
    key: "total_categories" as const,
    label: "Subject Areas",
    desc: "All disciplines",
    color: "text-[#55B9EA]",
    iconBg: "bg-[#55B9EA]/10 dark:bg-[#55B9EA]/15",
    border: "border-[#55B9EA]/15 dark:border-[#55B9EA]/20",
    shadow: "hover:shadow-[0_8px_30px_rgba(85,185,234,0.12)]",
    staticValue: null as string | null,
  },
  {
    icon: Globe,
    key: null,
    label: "Online Access",
    desc: "Always available",
    color: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/15",
    border: "border-emerald-200/40 dark:border-emerald-800/30",
    shadow: "hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]",
    staticValue: "24/7",
  },
];

export default function StatsSection() {
  const { data, isLoading } = useGetStatsQuery();
  const stats_data = data?.data;

  return (
    <section className="py-10 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #20659C 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12 opacity-0 animate-[heroReveal_0.5s_ease_0.1s_forwards]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#20659C]/8 dark:bg-[#20659C]/15 text-[#20659C] dark:text-[#55B9EA] text-xs font-bold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Growing Every Day
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">
            E-Library by the numbers
          </h2>
          <p className="mt-2 text-[#5E5E5E] dark:text-gray-400 max-w-md mx-auto">
            Serving every Norton University student with world-class academic resources.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STAT_CONFIGS.map((s, i) => {
            let value: string | null = null;
            if (s.staticValue) {
              value = s.staticValue;
            } else if (!isLoading && stats_data && s.key) {
              value = formatCount(stats_data[s.key]);
            }

            return (
              <div
                key={i}
                className={`group flex flex-col items-center text-center gap-4 p-7 rounded-2xl bg-white dark:bg-gray-900/80 border ${s.border} backdrop-blur-sm transition-all duration-300 ${s.shadow} hover:-translate-y-1.5 opacity-0 animate-[heroReveal_0.5s_ease_forwards]`}
                style={{ animationDelay: `${0.15 + 0.08 * i}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  <s.icon className={`w-7 h-7 ${s.color}`} />
                </div>

                <div>
                  {value === null ? (
                    <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-2 mx-auto" />
                  ) : (
                    <div className={`text-4xl sm:text-5xl font-black ${s.color} leading-none mb-1.5`}>
                      {value}
                    </div>
                  )}
                  <div className="text-sm font-bold text-[#1A1A1A] dark:text-white">{s.label}</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
