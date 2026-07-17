'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8">

        {/* Illustration */}
        <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-[#20659C]/10 dark:bg-[#55B9EA]/10 animate-pulse" />
          {/* Inner circle */}
          <div className="relative z-10 w-32 h-32 rounded-full bg-[#20659C]/10 dark:bg-[#55B9EA]/10 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-[#20659C] dark:text-[#55B9EA]" strokeWidth={1.2} />
          </div>
          {/* Floating 404 badge */}
          <span className="absolute -top-2 -right-2 bg-[#DF900A] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg select-none">
            404
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F1F5F9] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-[#5E5E5E] dark:text-[#94A3B8] text-base leading-relaxed">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
            <br />
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/10" />
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/10" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-white/10 text-[#1A1A1A] dark:text-[#F1F5F9] bg-white dark:bg-white/5 hover:bg-[#F8FAFC] dark:hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#20659C] hover:bg-[#1a5486] text-white transition-colors text-sm font-medium shadow-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            href="/library"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#DF900A] hover:bg-[#c47d09] text-white transition-colors text-sm font-medium shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            Browse Library
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-[#9CA3AF] dark:text-[#475569]">
          If you believe this is an error, please{' '}
          <Link href="/contact" className="underline hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
