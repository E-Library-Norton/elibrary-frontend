"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBook } from "@/hooks/useBooks";
import { getBooksReturnHref, withBooksReturnHref } from "@/lib/books-navigation";
import { useAppSelector } from "@/lib/hooks";
import { selectIsAuthenticated, selectIsAuthLoading } from "@/store/slices/authSlice";

// Dynamically import to avoid SSR issues (pdfjs uses browser APIs)
// No loading fallback here — the isLoading state below already covers the wait
const PdfReader = dynamic(() => import("@/components/pdf-reader/PdfReader"), {
  ssr: false,
});

export default function ReadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");
  const booksReturnHref = getBooksReturnHref(searchParams.get("from"));
  const detailHref = withBooksReturnHref(`/books/${id}`, booksReturnHref);

  const { book, isLoading, isError } = useBook(id);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectIsAuthLoading);

  // ── Not authenticated ────────────────────────────────────────
  if (!isAuthenticated && !isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#0f172a] gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">Login Required</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
            You need to be logged in to read this book.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button asChild variant="outline" className="flex-1">
            <Link href={detailHref}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading book metadata ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#0f172a] gap-5 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1e293b] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-slate-200 text-base font-semibold">សូមចាំបន្តិចមេ…</p>
          <p className="text-slate-500 text-sm mt-1">Preparing your book</p>
        </div>
      </div>
    );
  }

  // ── Error fetching book ───────────────────────────────────────
  if (isError || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#0f172a] gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-400/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">Book not found</h2>
          <p className="text-slate-400 text-sm mt-2">This book could not be loaded.</p>
        </div>
        <Button asChild variant="outline" className="w-full max-w-xs">
          <Link href={booksReturnHref}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Books
          </Link>
        </Button>
      </div>
    );
  }

  // ── No PDF available ─────────────────────────────────────────
  if (!book.pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#0f172a] gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">No PDF Available</h2>
          <p className="text-slate-400 text-sm mt-2">This book does not have a PDF file yet.</p>
        </div>
        <Button asChild variant="outline" className="w-full max-w-xs">
          <Link href={detailHref}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </Button>
      </div>
    );
  }

  // ── Render reader ─────────────────────────────────────────────
  // Use the same-origin proxy URL — never expose the R2 URL to the browser.
  const streamUrl = `/api/books/${id}/stream`;

  return (
    <div className="h-screen w-screen overflow-hidden">
      <PdfReader
        fileUrl={streamUrl}
        title={book.title}
        coverUrl={book.coverUrl}
        bookId={id}
        backHref={detailHref}
      />
    </div>
  );
}
