"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import {
  BookOpen,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Download,
  Heart,
  Share2,
  ChevronRight,
  Eye,
  Building2,
  Layers,
  GraduationCap,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Video,
  Headphones,
  Music,
  Play,
  Copy,
  Check,
  Twitter,
  Facebook,
  Sparkles,
  BookMarked,
  TrendingUp,
  X,
  Quote,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBook, useBooks } from "@/hooks/useBooks";
import { useAuth } from "@/hooks/useAuth";
import type { Book } from "@/types";
import { useGetVideoUrlQuery, useGetAudioUrlQuery, useShareBookMutation } from "@/store/api/booksApi";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getBooksReturnHref, withBooksReturnHref } from "@/lib/books-navigation";
import {
  toggleFavorite,
  selectIsFavorite,
  selectReadingProgress,
  addToRecentlyViewed,
  hydrateLibrary,
} from "@/store/slices/librarySlice";
import ReviewSection from "@/components/ReviewSection";
import { StarRating } from "@/components/ui/star-rating";

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
      <BookOpen className="w-24 h-24 text-white/50" />
    </div>
  );
}

// ── Loading skeleton
function DetailSkeleton() {
  return (
    <section className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-8" />
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse shadow-lg" />
          <div className="space-y-4 animate-pulse">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Share modal ─────
function ShareModal({
  open,
  onClose,
  title,
  url,
  onShare,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  onShare?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      if (onShare) onShare();
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url, onShare]);

  if (!open) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-gray-800 p-6 opacity-0 animate-[heroReveal_0.3s_ease_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X className="w-5 h-5 text-[#9CA3AF]" />
        </button>
        <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-1">Share this book</h3>
        <p className="text-sm text-[#5E5E5E] dark:text-gray-400 mb-6 line-clamp-1">{title}</p>

        {/* Social buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onShare}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F8FAFC] dark:bg-gray-800 hover:bg-[#1DA1F2]/10 border border-[#E2E8F0] dark:border-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group"
          >
            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
            <span className="text-xs font-medium text-[#5E5E5E] dark:text-gray-400 group-hover:text-[#1DA1F2]">Twitter</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onShare}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F8FAFC] dark:bg-gray-800 hover:bg-[#1877F2]/10 border border-[#E2E8F0] dark:border-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group"
          >
            <Facebook className="w-5 h-5 text-[#1877F2]" />
            <span className="text-xs font-medium text-[#5E5E5E] dark:text-gray-400 group-hover:text-[#1877F2]">Facebook</span>
          </a>
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onShare}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F8FAFC] dark:bg-gray-800 hover:bg-[#0088cc]/10 border border-[#E2E8F0] dark:border-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group"
          >
            <Send className="w-5 h-5 text-[#0088cc]" />
            <span className="text-xs font-medium text-[#5E5E5E] dark:text-gray-400 group-hover:text-[#0088cc]">Telegram</span>
          </a>
        </div>

        {/* Copy link */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-[#F8FAFC] dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 px-4 py-2.5 text-sm text-[#5E5E5E] dark:text-gray-400 overflow-hidden">
            <span className="truncate">{url}</span>
          </div>
          <Button
            onClick={copyLink}
            className={cn(
              "shrink-0 gap-2 rounded-xl transition-all duration-300",
              copied
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-[#20659C] hover:bg-[#55B9EA] text-white"
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {/* QR Code — scan to open on mobile */}
        <div className="mt-5 pt-5 border-t border-[#E2E8F0] dark:border-gray-700 flex flex-col items-center gap-2">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">Scan to open on mobile</p>
          <div
            role="img"
            aria-label={`QR code for ${title}`}
            className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm"
          >
            {url ? (
              <QRCode
                value={url}
                size={160}
                bgColor="#ffffff"
                fgColor="#111827"
                level="M"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center text-xs font-medium text-[#9CA3AF]">
                Preparing link...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reading progress bar
function ReadingProgressBar({ bookId }: { bookId: number }) {
  const progress = useAppSelector(selectReadingProgress(bookId));
  if (!progress) return null;

  const pct = Math.min(
    Math.round((progress.currentPage / Math.max(progress.totalPages, 1)) * 100),
    100
  );

  const mins = Math.floor(progress.timeSpentSeconds / 60);
  const timeLabel =
    mins < 60
      ? `${mins}m read`
      : `${Math.floor(mins / 60)}h ${mins % 60}m read`;

  return (
    <div className="bg-[#20659C]/5 dark:bg-[#20659C]/10 rounded-xl p-4 border border-[#20659C]/10 dark:border-[#20659C]/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#20659C] dark:text-[#55B9EA] flex items-center gap-1.5">
          <BookMarked className="w-3.5 h-3.5" />
          Reading Progress
        </span>
        <span className="text-xs font-bold text-[#20659C] dark:text-[#55B9EA]">{pct}%</span>
      </div>
      <div className="h-2 bg-[#20659C]/10 dark:bg-[#20659C]/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#20659C] to-[#55B9EA] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-[#5E5E5E] dark:text-gray-400">
        <span>Page {progress.currentPage} of {progress.totalPages}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeLabel}</span>
      </div>
    </div>
  );
}

// ── Citation helpers
type CitationFormat = 'APA' | 'MLA' | 'Chicago' | 'IEEE';

function _fmtAPA(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0];
  const last = p[p.length - 1];
  const initials = p.slice(0, -1).map((w) => `${w[0].toUpperCase()}.`).join(' ');
  return `${last}, ${initials}`;
}
function _fmtFirst(name: string) {
  const p = name.trim().split(/\s+/);
  const last = p[p.length - 1];
  const first = p.slice(0, -1).join(' ');
  return first ? `${last}, ${first}` : last;
}
function _fmtIEEE(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0];
  const last = p[p.length - 1];
  const initials = p.slice(0, -1).map((w) => `${w[0].toUpperCase()}.`).join(' ');
  return `${initials} ${last}`;
}
function buildCitation(fmt: CitationFormat, book: Book): string {
  const authors = book.Authors ?? [];
  const yr    = book.publicationYear ? String(book.publicationYear) : 'n.d.';
  const pub   = book.Publisher?.name ?? 'n.p.';
  const title = book.title;
  const isbn  = book.isbn ? ` ISBN: ${book.isbn}.` : '';
  const a = (list: typeof authors): string => {
    if (!list.length) return 'Unknown Author';
    if (fmt === 'APA') {
      if (list.length === 1) return _fmtAPA(list[0].name);
      if (list.length === 2) return `${_fmtAPA(list[0].name)}, & ${_fmtAPA(list[1].name)}`;
      return list.map((x) => _fmtAPA(x.name)).join(', & ');
    }
    if (fmt === 'IEEE') return list.map((x) => _fmtIEEE(x.name)).join(', ');
    if (list.length === 1) return _fmtFirst(list[0].name);
    if (list.length === 2) return `${_fmtFirst(list[0].name)}, and ${list[1].name}`;
    return `${_fmtFirst(list[0].name)}, et al.`;
  };
  if (fmt === 'APA')     return `${a(authors)} (${yr}). ${title}. ${pub}.${isbn}`;
  if (fmt === 'MLA')     return `${a(authors)}. ${title}. ${pub}, ${yr}.${isbn}`;
  if (fmt === 'Chicago') return `${a(authors)}. ${yr}. ${title}. ${pub}.${isbn}`;
  /* IEEE */             return `${a(authors)}, "${title}," ${pub}, ${yr}.${isbn}`;
}

function CitationGenerator({ book }: { book: Book }) {
  const [fmt, setFmt]       = useState<CitationFormat>('APA');
  const [copied, setCopied] = useState(false);
  const citation = buildCitation(fmt, book);
  const handleCopy = () => {
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const editions: Record<CitationFormat, string> = {
    APA:     '7th Ed. · American Psychological Association',
    MLA:     '9th Ed. · Modern Language Association',
    Chicago: '17th Ed. · Chicago Manual of Style',
    IEEE:    'Institute of Electrical and Electronics Engineers',
  };
  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-[#E2E8F0]/60 dark:border-gray-800/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0]/60 dark:border-gray-800/60 flex items-center gap-2">
        <Quote className="w-4 h-4 text-[#20659C]" />
        <h2 className="font-bold text-[#1A1A1A] dark:text-white text-sm tracking-wide uppercase">Cite this Book</h2>
      </div>
      <CardContent className="p-6">
        <div className="flex gap-1 mb-4 bg-[#F8FAFC] dark:bg-gray-800 rounded-xl p-1">
          {(['APA', 'MLA', 'Chicago', 'IEEE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFmt(f)}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200',
                fmt === f
                  ? 'bg-white dark:bg-gray-700 text-[#20659C] dark:text-[#55B9EA] shadow-sm'
                  : 'text-[#9CA3AF] hover:text-[#5E5E5E] dark:hover:text-gray-300',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative bg-[#F8FAFC] dark:bg-gray-800/80 rounded-xl p-4 pr-12 border border-[#E2E8F0] dark:border-gray-700 min-h-[80px]">
          <p className="text-sm text-[#1A1A1A] dark:text-gray-200 leading-relaxed font-mono">{citation}</p>
          <button
            onClick={handleCopy}
            title="Copy citation"
            className={cn(
              'absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200',
              copied
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-[#9CA3AF] hover:text-[#20659C] hover:bg-[#E2E8F0] dark:hover:bg-gray-700',
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-[#9CA3AF] mt-2">{editions[fmt]}</p>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   BOOK DETAIL PAGE
   ═══════════════════════════════════════════════ */
export default function BookDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");
  const booksReturnHref = getBooksReturnHref(searchParams.get("from"));
  const readHref = withBooksReturnHref(`/books/${id}/read`, booksReturnHref);
  const { book, isLoading, isError } = useBook(id);
  const [shareBook] = useShareBookMutation();

  const handleShare = useCallback(() => {
    if (book?.id) {
      shareBook(String(book.id)).catch(() => {});
    }
  }, [book?.id, shareBook]);

  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [favAnimating, setFavAnimating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'audio' | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      setShareUrl(`${window.location.origin}/books/${id}`);
    }
  }, [id]);

  // Auto-open correct media tab when ?tab= is in URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'video' || tab === 'audio') setActiveMediaTab(tab);
  }, [searchParams]);

  // Presigned media URLs — only fetched when user opens the player
  const { data: videoUrlData, isLoading: videoUrlLoading, isError: videoUrlError } = useGetVideoUrlQuery(
    id, { skip: activeMediaTab !== 'video' || !book?.videoUrl }
  );
  const { data: audioUrlData, isLoading: audioUrlLoading, isError: audioUrlError } = useGetAudioUrlQuery(
    id, { skip: activeMediaTab !== 'audio' || !book?.audioUrl }
  );

  const presignedVideoUrl = videoUrlData?.data?.url;
  const presignedAudioUrl = audioUrlData?.data?.url;

  const generateSummary = useCallback(async () => {
    if (aiSummary || summaryLoading) return;
    setSummaryLoading(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/books/${id}/summary`);
      const j = await r.json();
      setAiSummary(j.data?.summary ?? '');
    } catch {
      setAiSummary('Summary unavailable at this time.');
    } finally {
      setSummaryLoading(false);
    }
  }, [aiSummary, summaryLoading, id]);

  // Use book.id directly (same value stored in favorites) to avoid Number(id) type mismatch
  const isFav = useAppSelector(selectIsFavorite(book?.id ?? Number(id)));

  // Hydrate per-user library data — only if Navbar hasn't done it yet (userId not set in store)
  const libraryUserId = useAppSelector((s: { library: { userId: number | null } }) => s.library.userId);
  useEffect(() => {
    if (user?.id && !libraryUserId) dispatch(hydrateLibrary(user.id));
  }, [dispatch, user?.id, libraryUserId]);

  // Track recently viewed
  useEffect(() => {
    if (book) {
      dispatch(
        addToRecentlyViewed({
          bookId: book.id,
          title: book.title,
          coverUrl: book.coverUrl,
          category: book.Category?.name,
          readAt: new Date().toISOString(),
        })
      );
    }
  }, [book, dispatch]);

  // Fetch related books from same category
  const { books: relatedBooks } = useBooks({
    limit: 4,
    categoryId: book?.Category?.id ? String(book.Category.id) : undefined,
    sortBy: "views",
    sortOrder: "DESC",
  });
  const filteredRelated = relatedBooks.filter((b) => b.id !== Number(id)).slice(0, 3);

  const handleFavorite = () => {
    if (!book) return;
    setFavAnimating(true);
    setTimeout(() => setFavAnimating(false), 600);
    dispatch(
      toggleFavorite({
        id: book.id,
        title: book.title,
        coverUrl: book.coverUrl,
        category: book.Category?.name,
        addedAt: new Date().toISOString(),
        userId: user?.id,
      })
    );
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !book) {
    return (
      <section className="py-20 bg-[#F8FAFC] dark:bg-gray-950 min-h-screen">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-2">Book not found</h2>
          <p className="text-[#5E5E5E] dark:text-gray-400 mb-8">
            This book doesn&apos;t exist or failed to load.
          </p>
          <Button asChild className="gap-2 bg-[#20659C] hover:bg-[#55B9EA]">
            <Link href={booksReturnHref}>
              <ArrowLeft className="w-4 h-4" /> Back to Books
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const allAuthors = book.Authors ?? [];
  const displayAuthors = allAuthors.map((a) => a.name).join(", ") || "—";

  return (
    <>
      {/* ── Clean page wrapper ── */}
      <section className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-[#9CA3AF] mb-8 opacity-0 animate-[heroReveal_0.5s_ease_0.1s_forwards]">
            <Link href="/" className="hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={booksReturnHref} className="hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors">Books</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1A1A1A] dark:text-white font-medium line-clamp-1">{book.title}</span>
          </nav>

          {/* Back button */}
          <Button variant="ghost" asChild className="gap-2 text-[#5E5E5E] dark:text-gray-400 hover:text-[#20659C] dark:hover:text-[#55B9EA] hover:bg-[#20659C]/5 mb-6 -ml-3 opacity-0 animate-[heroReveal_0.5s_ease_0.15s_forwards]">
            <Link href={booksReturnHref}>
              <ArrowLeft className="w-4 h-4" /> Back to Books
            </Link>
          </Button>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            {/* ── Left: Cover + Actions ── */}
            <div className="opacity-0 animate-[heroReveal_0.6s_ease_0.15s_forwards]">
              <div className="sticky top-24 space-y-5">
                {/* Cover */}
                <div className="group relative">
                  <div className="absolute -inset-2 bg-gradient-to-b from-gray-200/40 to-gray-300/30 dark:from-gray-700/30 dark:to-gray-800/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl ring-1 ring-[#E2E8F0] dark:ring-gray-800">
                    <BookCover coverUrl={book.coverUrl ? `/api/books/${id}/cover?v=${encodeURIComponent(book.updatedAt || '')}` : null} title={book.title} />
                    {/* PDF badge */}
                    {book.pdfUrl && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-emerald-500/90 backdrop-blur-sm hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1 shadow-lg">
                          <FileText className="w-3 h-3 mr-1" /> PDF
                        </Badge>
                      </div>
                    )}
                    {/* Bottom gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </div>

                {/* Reading progress */}
                <ReadingProgressBar bookId={book.id} />

                {/* Primary action */}
                {book.pdfUrl ? (
                  <Button className="w-full gap-2.5 bg-[#20659C] hover:bg-[#55B9EA] shadow-lg shadow-[#20659C]/20 hover:shadow-[#55B9EA]/30 transition-all duration-300 hover:scale-[1.02] h-12 text-base font-semibold rounded-xl" asChild>
                    <Link href={readHref}>
                      <Eye className="w-5 h-5" /> Read Online
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full gap-2 h-12 rounded-xl" disabled>
                    <FileText className="w-5 h-5" /> PDF Not Available
                  </Button>
                )}

                {/* Media Resources (Video/Audio) */}
                {(book.videoUrl || book.audioUrl) && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {book.videoUrl && (
                      <Button
                        variant={activeMediaTab === 'video' ? 'default' : 'outline'}
                        onClick={() => setActiveMediaTab(activeMediaTab === 'video' ? null : 'video')}
                        className={cn(
                          "w-full gap-2.5 h-11 rounded-xl font-semibold transition-all duration-300",
                          activeMediaTab === 'video'
                            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20"
                            : "border-purple-200 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-purple-600 dark:text-purple-400"
                        )}
                      >
                        <Video className="w-4 h-4" />
                        {activeMediaTab === 'video' ? 'Hide Video Player' : 'Watch Supplementary Video'}
                      </Button>
                    )}
                    {book.audioUrl && (
                      <Button
                        variant={activeMediaTab === 'audio' ? 'default' : 'outline'}
                        onClick={() => setActiveMediaTab(activeMediaTab === 'audio' ? null : 'audio')}
                        className={cn(
                          "w-full gap-2.5 h-11 rounded-xl font-semibold transition-all duration-300",
                          activeMediaTab === 'audio'
                            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20"
                            : "border-amber-200 dark:border-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-900/10 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        <Headphones className="w-4 h-4" />
                        {activeMediaTab === 'audio' ? 'Hide Audio Player' : 'Listen to Audio Version'}
                      </Button>
                    )}
                  </div>
                )}

                {/* Secondary actions row */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Favorite */}
                  <button
                    onClick={handleFavorite}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 hover:-translate-y-0.5",
                      isFav
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500"
                        : "bg-white/80 dark:bg-gray-900/80 border-[#E2E8F0] dark:border-gray-800 text-[#5E5E5E] dark:text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800"
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-transform duration-300",
                        isFav && "fill-current",
                        favAnimating && "scale-125"
                      )}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      {isFav ? "Saved" : "Save"}
                    </span>
                  </button>

                  {/* Download */}
                  {book.pdfUrl ? (
                    <a
                      href={`/api/books/${id}/download`}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-white/80 dark:bg-gray-900/80 border-[#E2E8F0] dark:border-gray-800 text-[#5E5E5E] dark:text-gray-400 hover:text-[#20659C] hover:border-[#20659C]/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Download className="w-5 h-5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Download</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-gray-50 dark:bg-gray-900/50 border-[#E2E8F0] dark:border-gray-800 text-[#9CA3AF] cursor-not-allowed">
                      <Download className="w-5 h-5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">N/A</span>
                    </div>
                  )}

                  {/* Share */}
                  <button
                    onClick={() => setShareOpen(true)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-white/80 dark:bg-gray-900/80 border-[#E2E8F0] dark:border-gray-800 text-[#5E5E5E] dark:text-gray-400 hover:text-[#20659C] hover:border-[#20659C]/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Share</span>
                  </button>
                </div>

                 {/* Quick stats */}
                <div className="flex items-center justify-around py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-[#E2E8F0]/60 dark:border-gray-800/60">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#20659C]">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{(book.views ?? 0).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">Views</p>
                  </div>
                  <div className="w-px h-8 bg-[#E2E8F0] dark:bg-gray-800" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#DF900A]">
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{(book.downloads ?? 0).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">Downloads</p>
                  </div>
                  <div className="w-px h-8 bg-[#E2E8F0] dark:bg-gray-800" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sky-500">
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{(book.shares ?? 0).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">Shares</p>
                  </div>
                  {book.pages && (
                    <>
                      <div className="w-px h-8 bg-[#E2E8F0] dark:bg-gray-800" />
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-[#5E5E5E] dark:text-gray-300">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="text-sm font-bold">{book.pages}</span>
                        </div>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">Pages</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: Details ── */}
            <div className="space-y-8 pt-2">
              {/* Header */}
              <div className="opacity-0 animate-[heroReveal_0.6s_ease_0.25s_forwards]">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {book.Category && (
                    <Badge className="bg-[#20659C]/10 text-[#20659C] dark:bg-[#20659C]/20 dark:text-[#55B9EA] border-0 hover:bg-[#20659C]/15">
                      {book.Category.name}
                    </Badge>
                  )}
                  {book.publicationYear && (
                    <Badge variant="outline" className="text-xs text-[#9CA3AF] border-[#E2E8F0] dark:border-gray-700">
                      <Calendar className="w-3 h-3 mr-1" /> {book.publicationYear}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] dark:text-white leading-tight mb-3">
                  {book.title}
                </h1>
                {book.titleKh && (
                  <p className="text-lg text-[#5E5E5E] dark:text-gray-400 mb-2">{book.titleKh}</p>
                )}
                {allAuthors.length > 0 && (
                  <div className="flex items-center gap-3 text-[#5E5E5E] dark:text-gray-400">
                    <div className="flex -space-x-2">
                      {allAuthors.slice(0, 3).map((a) => {
                        const initials = a.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                        return (
                          <div key={a.id} className="w-8 h-8 rounded-full bg-[#20659C] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#F8FAFC] dark:ring-gray-950">
                            {initials}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-base">
                      by <span className="font-semibold text-[#1A1A1A] dark:text-white">{displayAuthors}</span>
                    </span>
                  </div>
                )}
                {/* Star Rating */}
                {book.averageRating ? (
                  <div className="mt-3">
                    <StarRating
                      value={Number(book.averageRating)}
                      readOnly
                      size="sm"
                      showValue
                      count={Number(book.reviewCount) || 0}
                    />
                  </div>
                ) : null}
              </div>

              {/* Media Player */}
              {activeMediaTab && (book.videoUrl || book.audioUrl) && (
                <div className="opacity-0 animate-[heroReveal_0.4s_ease_forwards]">
                  <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-[#E2E8F0]/60 dark:border-gray-800/60">
                    {/* Tab bar */}
                    <div className="flex border-b border-[#E2E8F0]/60 dark:border-gray-800/60">
                      {book.videoUrl && (
                        <button
                          onClick={() => setActiveMediaTab('video')}
                          className={cn(
                            "flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px",
                            activeMediaTab === 'video'
                              ? "border-purple-600 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-900/10"
                              : "border-transparent text-[#5E5E5E] dark:text-gray-400 hover:text-purple-600 hover:border-purple-300"
                          )}
                        >
                          <Video className="w-4 h-4" /> Video
                        </button>
                      )}
                      {book.audioUrl && (
                        <button
                          onClick={() => setActiveMediaTab('audio')}
                          className={cn(
                            "flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px",
                            activeMediaTab === 'audio'
                              ? "border-amber-600 text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-900/10"
                              : "border-transparent text-[#5E5E5E] dark:text-gray-400 hover:text-amber-600 hover:border-amber-300"
                          )}
                        >
                          <Headphones className="w-4 h-4" /> Audio
                        </button>
                      )}
                      <button
                        onClick={() => setActiveMediaTab(null)}
                        className="ml-auto flex items-center justify-center px-4 text-[#9CA3AF] hover:text-[#5E5E5E] transition-colors"
                        title="Close player"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <CardContent className="p-5">
                      {/* ── Video Player ── */}
                      {activeMediaTab === 'video' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                            <Play className="w-3.5 h-3.5" /> Supplementary Video
                          </div>
                          {videoUrlLoading && (
                            <div className="flex items-center justify-center h-40 rounded-xl bg-purple-50 dark:bg-purple-900/10">
                              <div className="flex flex-col items-center gap-3 text-purple-600 dark:text-purple-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-sm font-medium">Loading secure video stream…</span>
                              </div>
                            </div>
                          )}
                          {videoUrlError && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                              <AlertCircle className="w-5 h-5 shrink-0" />
                              <div>
                                <p className="text-sm font-semibold">Could not load video</p>
                                <p className="text-xs mt-0.5">Please make sure you are signed in and try again.</p>
                              </div>
                            </div>
                          )}
                          {presignedVideoUrl && (
                            <video
                              key={presignedVideoUrl}
                              controls
                              controlsList="nodownload"
                              className="w-full rounded-xl bg-black shadow-lg"
                              style={{ maxHeight: '480px' }}
                            >
                              <source src={presignedVideoUrl} />
                              Your browser does not support video playback.
                            </video>
                          )}
                        </div>
                      )}

                      {/* ── Audio Player ── */}
                      {activeMediaTab === 'audio' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-300 uppercase tracking-wider">
                            <Music className="w-3.5 h-3.5" /> Audio Version
                          </div>
                          {audioUrlLoading && (
                            <div className="flex items-center justify-center h-32 rounded-xl bg-amber-50 dark:bg-amber-900/10">
                              <div className="flex flex-col items-center gap-3 text-amber-600 dark:text-amber-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-sm font-medium">Loading secure audio stream…</span>
                              </div>
                            </div>
                          )}
                          {audioUrlError && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                              <AlertCircle className="w-5 h-5 shrink-0" />
                              <div>
                                <p className="text-sm font-semibold">Could not load audio</p>
                                <p className="text-xs mt-0.5">Please make sure you are signed in and try again.</p>
                              </div>
                            </div>
                          )}
                          {presignedAudioUrl && (
                            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-5 border border-amber-200/60 dark:border-amber-800/30">
                              {/* Cover art + title */}
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-md ring-2 ring-amber-200 dark:ring-amber-800">
                                  {book.coverUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={`/api/books/${id}/cover`} alt={book.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                      <Headphones className="w-7 h-7 text-white/60" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-[#1A1A1A] dark:text-white text-sm line-clamp-2">{book.title}</p>
                                  {book.Authors && book.Authors.length > 0 && (
                                    <p className="text-xs text-[#5E5E5E] dark:text-gray-400 mt-0.5">
                                      {book.Authors.map((a) => a.name).join(", ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <audio
                                key={presignedAudioUrl}
                                controls
                                controlsList="nodownload"
                                className="w-full"
                                style={{ accentColor: '#d97706' }}
                              >
                                <source src={presignedAudioUrl} />
                                Your browser does not support audio playback.
                              </audio>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Book Summary */}
              <div className="opacity-0 animate-[heroReveal_0.6s_ease_0.35s_forwards]">
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-[#E2E8F0]/60 dark:border-gray-800/60 overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E2E8F0]/60 dark:border-gray-800/60 flex items-center justify-between">
                    <h2 className="font-bold text-[#1A1A1A] dark:text-white text-sm tracking-wide uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#DF900A]" />
                      Book Summary
                    </h2>
                    {!aiSummary && (
                      <button
                        onClick={generateSummary}
                        disabled={summaryLoading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#20659C] hover:text-[#55B9EA] disabled:opacity-50 transition-colors"
                      >
                        {summaryLoading ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="ml-1">Generating…</span></>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5" /><span className="ml-1">✨ AI Summary</span></>
                        )}
                      </button>
                    )}
                  </div>
                  <CardContent className="p-6">
                    {aiSummary ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#DF900A] font-semibold">
                          <Sparkles className="w-3.5 h-3.5" /> AI-Generated Summary
                        </div>
                        <p className="text-[#1A1A1A] dark:text-gray-200 leading-relaxed">{aiSummary}</p>
                        {book.description && (
                          <details className="mt-3">
                            <summary className="text-xs text-[#9CA3AF] cursor-pointer hover:text-[#5E5E5E] transition-colors select-none">
                              Show original description ▾
                            </summary>
                            <p className="text-sm text-[#5E5E5E] dark:text-gray-400 leading-relaxed mt-2">{book.description}</p>
                          </details>
                        )}
                      </div>
                    ) : book.description ? (
                      <p className="text-[#5E5E5E] dark:text-gray-400 leading-relaxed text-base">{book.description}</p>
                    ) : (
                      <p className="text-[#9CA3AF] text-sm italic">No description available. Click ✨ AI Summary to generate one.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Authors section */}
              {allAuthors.length > 0 && (
                <div className="opacity-0 animate-[heroReveal_0.6s_ease_0.45s_forwards]">
                  <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#20659C]" />
                    {allAuthors.length === 1 ? "Author" : "Authors"}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {allAuthors.map((author) => {
                      const isPrimary = (author as { isPrimaryAuthor?: boolean }).isPrimaryAuthor;
                      const initials = author.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <div key={author.id} className="group relative">
                          <div className="absolute -inset-px bg-gradient-to-r from-[#20659C] to-[#55B9EA] rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-300" />
                          <div className="relative flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-[#E2E8F0]/60 dark:border-gray-800/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#1A1A1A] dark:text-white text-sm">{author.name}</span>
                                {isPrimary && (
                                  <Badge className="bg-[#DF900A]/10 text-[#DF900A] border-0 text-[10px] px-1.5 py-0">Primary</Badge>
                                )}
                              </div>
                              {(author as { nameKh?: string }).nameKh && (
                                <p className="text-xs text-[#9CA3AF] mt-0.5">{(author as { nameKh?: string }).nameKh}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Book Details table */}
              <div className="opacity-0 animate-[heroReveal_0.6s_ease_0.55s_forwards]">
                <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-[#E2E8F0]/60 dark:border-gray-800/60">
                  <div className="px-6 py-4 border-b border-[#E2E8F0]/60 dark:border-gray-800/60 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#20659C]" />
                    <h2 className="font-bold text-[#1A1A1A] dark:text-white text-sm tracking-wide uppercase">Book Details</h2>
                  </div>
                  <div className="divide-y divide-[#E2E8F0]/60 dark:divide-gray-800/60">
                    {[
                      { label: "Category", icon: Tag, value: book.Category?.name },
                      { label: "Publisher", icon: Building2, value: book.Publisher?.name },
                      { label: "Department", icon: GraduationCap, value: book.Department?.name },
                      { label: "Material Type", icon: Layers, value: book.MaterialType?.name },
                      { label: "Publication Year", icon: Calendar, value: book.publicationYear ? String(book.publicationYear) : undefined },
                      { label: "Pages", icon: BookOpen, value: book.pages ? String(book.pages) : undefined },
                      { label: "ISBN", icon: Tag, value: book.isbn },
                      { label: "Authors", icon: User, value: displayAuthors !== "—" ? displayAuthors : undefined },
                    ]
                      .filter((r) => r.value !== undefined && r.value !== "")
                      .map(({ label, icon: Icon, value }) => (
                        <div key={label} className="flex items-center px-6 py-4 text-sm transition-colors hover:bg-[#20659C]/[0.03] dark:hover:bg-[#20659C]/[0.06]">
                          <span className="flex items-center gap-3 w-44 text-[#5E5E5E] dark:text-gray-400 shrink-0 font-medium">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#20659C]/10 to-[#55B9EA]/10 dark:from-[#20659C]/20 dark:to-[#55B9EA]/20 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-[#20659C]" />
                            </span>
                            {label}
                          </span>
                          <span className="text-[#1A1A1A] dark:text-white font-semibold">{value}</span>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>

              {/* Citation Generator */}
              <div className="opacity-0 animate-[heroReveal_0.6s_ease_0.60s_forwards]">
                <CitationGenerator book={book} />
              </div>

              {/* Related Books */}
              {filteredRelated.length > 0 && (
                <div className="opacity-0 animate-[heroReveal_0.6s_ease_0.65s_forwards]">
                  <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#DF900A]" />
                    You May Also Like
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {filteredRelated.map((rb) => (
                      <Link href={withBooksReturnHref(`/books/${rb.id}`, booksReturnHref)} key={rb.id} className="group">
                        <div className="relative">
                          <div className="absolute -inset-px bg-gradient-to-r from-[#20659C] to-[#55B9EA] rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-300" />
                          <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 border-[#E2E8F0]/60 dark:border-gray-800/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                            <div className="aspect-[3/4] overflow-hidden">
                              <BookCover
                                coverUrl={rb.coverUrl ? `/api/books/${rb.id}/cover?v=${encodeURIComponent(rb.updatedAt || '')}` : null}
                                title={rb.title}
                                className="transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <CardContent className="p-3">
                              <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white line-clamp-2 group-hover:text-[#20659C] transition-colors leading-snug">
                                {rb.title}
                              </h4>
                              {rb.Authors && rb.Authors.length > 0 && (
                                <p className="text-[10px] text-[#9CA3AF] mt-1 line-clamp-1">
                                  {rb.Authors.map((a) => a.name).join(", ")}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews & Ratings */}
              <div className="opacity-0 animate-[heroReveal_0.6s_ease_0.75s_forwards]">
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-[#E2E8F0]/60 dark:border-gray-800/60 overflow-hidden">
                  <CardContent className="p-6">
                    <ReviewSection bookId={id} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={book.title} url={shareUrl} onShare={handleShare} />
    </>
  );
}
