"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowRight, GraduationCap, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useGetBooksQuery } from "@/store/api/booksApi";
import { WarpBackground } from "@/components/ui/warp-background";


export default function HeroSection() {
  const [query, setQuery] = useState("");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data: booksData } = useGetBooksQuery({ limit: 1, page: 1 });
  const totalBooks = booksData?.data?.total
    ? `${Number(booksData.data.total).toLocaleString()}+`
    : "12,000+";

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-white dark:bg-[#07090f]">
      <WarpBackground
        className="flex-1 flex flex-col items-center justify-center border-none rounded-none bg-transparent p-0 w-full min-h-screen"
        gridColor={isDark ? "rgba(85, 185, 234, 0.15)" : "rgba(32, 101, 156, 0.08)"}
        perspective={250}
        beamsPerSide={4}
        beamDuration={4}
      >
        {/* ── Glow blobs ── */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#20659C]/[0.07] dark:bg-[#20659C]/[0.14] blur-[130px]" />
          <div className="absolute top-[15%] right-[5%] w-[280px] h-[280px] rounded-full bg-[#55B9EA]/[0.07] dark:bg-[#55B9EA]/[0.10] blur-[90px]" />
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-10 pb-0">
          <div className="w-full max-w-4xl mx-auto text-center">

            {/* Badge */}
            <div className="mb-6 opacity-0 animate-[heroReveal_0.7s_ease_0.1s_forwards]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#20659C]/20 dark:border-[#20659C]/40 bg-[#20659C]/[0.06] dark:bg-[#20659C]/[0.12] px-4 py-1.5 text-sm font-medium text-[#20659C] dark:text-[#55B9EA]">
                <BookMarked className="w-3.5 h-3.5" />
                Norton University · Digital Library
              </span>
            </div>

            {/* Headline */}
            <h1 className="opacity-0 animate-[heroReveal_0.8s_ease_0.2s_forwards] leading-[1.06] tracking-tight mb-6">
              <span className="block text-5xl sm:text-6xl lg:text-[5.5rem] font-black text-[#20659C] dark:text-white uppercase">
                Norton
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-[4.5rem] font-black text-[#DF900A] uppercase">
                Education Tomorrow
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-[4.5rem] font-black text-[#55B9EA] uppercase">
                Leaders
              </span>
            </h1>

            {/* Sub */}
            <p className="max-w-xl mx-auto text-base sm:text-xl text-gray-500 dark:text-white/40 leading-relaxed mb-10 opacity-0 animate-[heroReveal_0.8s_ease_0.35s_forwards]">
              Access&nbsp;<span className="font-semibold text-gray-800 dark:text-white/70">{totalBooks} books</span>,
              research papers and digital resources — free for every Norton University student, anytime, anywhere.
            </p>

            {/* Search */}
            <div className="max-w-lg mx-auto mb-8 opacity-0 animate-[heroReveal_0.8s_ease_0.45s_forwards]">
              <div className="flex gap-2 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.10] rounded-2xl p-1.5 shadow-sm focus-within:border-[#20659C]/50 dark:focus-within:border-white/[0.22] transition-all duration-300">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/25" />
                  <Input
                    placeholder="Search books, authors, subjects..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-11 bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-[#20659C] hover:bg-[#1a5080] text-white rounded-xl px-6 h-11 font-semibold shadow transition-all duration-300 hover:scale-[1.02]"
                  asChild
                >
                  <Link href={query ? `/books?name=${encodeURIComponent(query)}` : "/books"}>
                    Search
                  </Link>
                </Button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 opacity-0 animate-[heroReveal_0.8s_ease_0.55s_forwards]">
              <Button
                size="lg"
                className="bg-[#20659C] hover:bg-[#1a5080] text-white gap-2 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                asChild
              >
                <Link href="/books">
                  <BookOpen className="w-4 h-4" />
                  Start Reading — Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-200 dark:border-white/[0.12] text-gray-700 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-[#20659C]/50 gap-2 rounded-xl font-semibold bg-transparent hover:bg-[#20659C]/[0.05] dark:hover:bg-white/[0.06] transition-all duration-300"
                asChild
              >
                <Link href="/about">
                  <GraduationCap className="w-4 h-4" />
                  About Norton E-Library
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </WarpBackground>
    </section>
  );
}


