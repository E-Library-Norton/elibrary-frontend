"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Headphones,
  ArrowRight,
  Eye,
  Download,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetBooksQuery } from "@/store/api/booksApi";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

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
      <Headphones className="w-16 h-16 text-white/50" />
    </div>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden opacity-0 animate-[heroReveal_0.5s_ease_forwards]"
      style={{ animationDelay: `${0.08 * index}s` }}
    >
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60 rounded-2xl overflow-hidden">
        <div className="h-52 bg-gray-200 dark:bg-gray-800" />
        <div className="p-5 space-y-3">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedAudios() {
  const { data, isLoading } = useGetBooksQuery({
    limit: 6,
    hasAudio: "true",
    sortBy: "views",
    sortOrder: "DESC",
  });
  const books: Book[] = (data?.data?.books ?? []).filter((b) => b.audioUrl);

  if (!isLoading && books.length === 0) return null;

  return (
    <section className="py-10 bg-[#F8FAFC] dark:bg-gray-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Headphones className="w-3.5 h-3.5" />
              Audio Library
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">
              Listen & Learn
            </h2>
            <p className="mt-2 text-[#5E5E5E] dark:text-gray-400 max-w-md text-base">
              Audiobooks and narration for learning on the go.
            </p>
          </div>
          <Button variant="outline" asChild className="rounded-xl border-amber-200 hover:bg-amber-50">
            <Link href="/audios">
              View All Audio <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} index={i} />)
            : books.map((book, index) => (
                <Link
                  href={`/books/${book.id}?tab=audio`}
                  key={book.id}
                  className="group relative bg-white dark:bg-gray-900 border border-[#E2E8F0]/60 dark:border-gray-800/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden">
                    <AudioCover
                      coverUrl={book.coverUrl ? `/api/books/${book.id}/cover` : null}
                      title={book.title}
                      className="transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                       <Badge className="bg-amber-600 text-white border-0 text-[10px] font-bold">
                          AUDIO
                       </Badge>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       {book.Category && (
                         <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                           {book.Category.name}
                         </span>
                       )}
                    </div>
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white leading-snug line-clamp-2 text-lg mb-2">
                      {book.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="w-3.5 h-3.5" /> {book.views}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Download className="w-3.5 h-3.5" /> {book.downloads}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        Listen Now <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
