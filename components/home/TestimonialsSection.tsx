"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { useGetPublicReviewsQuery } from "@/store/api/reviewApi";
import type { PublicReview } from "@/store/api/reviewApi";

// ── Color palette for avatars 
const COLORS = [
  "bg-[#20659C]", "bg-[#DF900A]", "bg-[#55B9EA]",
  "bg-emerald-500", "bg-purple-500", "bg-rose-500",
  "bg-indigo-500", "bg-teal-500", "bg-amber-500",
  "bg-cyan-600", "bg-pink-500", "bg-lime-600",
];

// ── Internal shape 
interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string | null;
  message: string;
  rating: number;
  bookTitle: string;
}

// ── Fallback data 
const fallbackTestimonials: Testimonial[] = [
  { id: 1,  name: "Sophy Chann",    role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "E-Library Norton has completely transformed how I study. I can access all my required textbooks without buying them." },
  { id: 2,  name: "Ratanak Pich",   role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "The variety of books is incredible. Every time I search for a topic related to my course, I find multiple helpful resources." },
  { id: 3,  name: "Sreymom Heng",   role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "As a medical student I need accurate, up-to-date textbooks. E-Library Norton has them all. The 24/7 access is a lifesaver." },
  { id: 4,  name: "Visal Keo",      role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "Having instant access to legal textbooks and case studies made my research so much easier." },
  { id: 5,  name: "Dara Meas",      role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "The PDF reader is smooth and I can bookmark pages. It feels like a real library but available on my phone at 2 AM." },
  { id: 6,  name: "Bopha Tep",      role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "Finding reference materials for my thesis was so easy. The categorization by department is brilliant." },
  { id: 7,  name: "Chenda Ly",      role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "I love how fast the search is. I can find any book within seconds and read it right in the browser." },
  { id: 8,  name: "Pisey Noun",     role: "Student", avatar: null, rating: 4, bookTitle: "E-Library Norton", message: "Best digital library I have ever used. The interface is clean and very easy to navigate for students." },
  { id: 9,  name: "Kosal Morn",     role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "Good documents and sharing resources available for all students. Highly recommended platform." },
  { id: 10, name: "Elibrary Norton",role: "Student", avatar: null, rating: 5, bookTitle: "E-Library Norton", message: "We are committed to providing quality library services. Please tell us how we can improve." },
];

function mapReview(r: PublicReview): Testimonial {
  const u = r.User;
  const name = u
    ? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username
    : "Anonymous";
  const role = "Student";
  return {
    id: r.id,
    name,
    role,
    avatar: u?.avatar ?? null,
    message: r.comment,
    rating: r.rating,
    bookTitle: r.Book?.title ?? "E-Library Norton",
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Single review card 
function ReviewCard({
  testimonial,
  colorIdx,
}: {
  testimonial: Testimonial;
  colorIdx: number;
}) {
  const color = COLORS[colorIdx % COLORS.length];
  const initials = getInitials(testimonial.name);

  return (
    <figure
      className={cn(
        "relative w-72 cursor-pointer overflow-hidden rounded-2xl border p-5 mx-3",
        "border-gray-200/80 bg-white hover:shadow-md",
        "dark:border-gray-700/60 dark:bg-gray-900/70 dark:hover:bg-gray-900",
        "transition-all duration-200 flex flex-col gap-3"
      )}
    >
      {/* Top row: quote icon + stars */}
      <div className="flex items-start justify-between">
        <span className="text-5xl leading-none font-serif text-gray-200 dark:text-gray-700 select-none mt-[-6px]">
          &ldquo;
        </span>
        <div className="flex gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, j) => (
            <Star
              key={j}
              className={cn(
                "w-3.5 h-3.5",
                j < testimonial.rating
                  ? "fill-[#DF900A] text-[#DF900A]"
                  : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* Review text */}
      <blockquote className="text-sm text-[#5E5E5E] dark:text-gray-300 leading-relaxed line-clamp-3 flex-1">
        &ldquo;{testimonial.message}&rdquo;
      </blockquote>

      {/* Book title */}
      {testimonial.bookTitle !== "E-Library Norton" && (
        <p className="text-[11px] text-[#20659C] dark:text-[#55B9EA] truncate font-medium flex items-center gap-1">
          <span>📖</span> {testimonial.bookTitle}
        </p>
      )}

      {/* Divider */}
      <hr className="border-gray-100 dark:border-gray-800" />

      {/* User info */}
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
          <span className="text-[11px] font-bold text-white">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white truncate leading-tight">
            {testimonial.name}
          </p>
          <p className="text-xs text-[#9CA3AF] leading-tight">{testimonial.role}</p>
        </div>
      </div>
    </figure>
  );
}

// ── Skeleton card 
function ReviewCardSkeleton() {
  return (
    <figure className="relative w-72 overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-900/70 p-5 mx-3 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="flex gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="w-3.5 h-3.5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/5" />
      </div>
      <hr className="border-gray-100 dark:border-gray-800" />
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-2.5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </figure>
  );
}

// ── Main section 
export default function TestimonialsSection() {
  const { data, isLoading } = useGetPublicReviewsQuery({ limit: 50 });

  const testimonials: Testimonial[] =
    data?.data && data.data.length > 0
      ? data.data.map(mapReview)
      : fallbackTestimonials;

  // Ensure enough items for two rows by repeating if needed
  const ensure = (min: number): Testimonial[] => {
    let arr = [...testimonials];
    while (arr.length < min) arr = [...arr, ...testimonials];
    return arr;
  };

  const half = Math.ceil(testimonials.length / 2);
  const row1 = ensure(Math.max(half, 5));
  const row2 = ensure(Math.max(testimonials.length - half, 5)).slice(half > 0 ? half : 5);

  // ~6s per card so speed stays constant regardless of how many cards exist
  const dur1 = `${row1.length * 4}s`;
  const dur2 = `${row2.length * 3}s`;

  const skeletons = Array.from({ length: 5 });

  return (
    <section className="py-20 bg-[#F8FAFC] dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 opacity-0 animate-[heroReveal_0.5s_ease_0.1s_forwards]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DF900A]/10 text-[#DF900A] text-xs font-bold uppercase tracking-wider mb-3">
            <Quote className="w-3.5 h-3.5" />
            Reader Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">
            Loved by students across campus
          </h2>
          <p className="mt-2 text-[#5E5E5E] dark:text-gray-400 max-w-md mx-auto text-base">
            Here&apos;s what Norton University students are saying about their library experience.
          </p>
        </div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative mb-4">
        <Marquee pauseOnHover style={{ "--duration": dur1 } as React.CSSProperties}>
          {isLoading
            ? skeletons.map((_, i) => <ReviewCardSkeleton key={`sk1-${i}`} />)
            : row1.map((t, i) => (
                <ReviewCard key={`r1-${t.id}-${i}`} testimonial={t} colorIdx={i} />
              ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] dark:from-gray-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F8FAFC] dark:from-gray-950 to-transparent z-10" />
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative">
        <Marquee reverse pauseOnHover style={{ "--duration": dur2 } as React.CSSProperties}>
          {isLoading
            ? skeletons.map((_, i) => <ReviewCardSkeleton key={`sk2-${i}`} />)
            : row2.map((t, i) => (
                <ReviewCard key={`r2-${t.id}-${i}`} testimonial={t} colorIdx={i + 6} />
              ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] dark:from-gray-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F8FAFC] dark:from-gray-950 to-transparent z-10" />
      </div>
    </section>
  );
}
