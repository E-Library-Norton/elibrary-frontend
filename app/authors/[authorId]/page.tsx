import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthorDetails } from "@/lib/server/authors";

const PAGE_SIZE = 12;

interface AuthorPageProps {
  params: Promise<{ authorId: string }>;
  searchParams: Promise<{ page?: string }>;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const visiblePages = 7;
  const half = Math.floor(visiblePages / 2);
  const start = Math.max(
    1,
    Math.min(currentPage - half, totalPages - visiblePages + 1)
  );
  const end = Math.min(totalPages, start + visiblePages - 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { authorId } = await params;

  try {
    const author = await getAuthorDetails(authorId, 1, PAGE_SIZE);
    if (!author) return { title: "Author Not Found" };

    return {
      title: author.name,
      description:
        author.biography ||
        `Explore ${author.totalBooks} books written by ${author.name}.`,
    };
  } catch {
    return { title: "Author" };
  }
}

export default async function AuthorPage({
  params,
  searchParams,
}: AuthorPageProps) {
  const [{ authorId }, query] = await Promise.all([params, searchParams]);
  const requestedPage = Number(query.page ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const author = await getAuthorDetails(authorId, page, PAGE_SIZE);

  if (!author) notFound();

  const totalPages = Math.max(author.totalPages, 1);

  return (
    <section className="min-h-screen bg-[#F8FAFC] py-10 dark:bg-gray-950 sm:py-14">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="-ml-3">
          <Link href="/books">
            <ArrowLeft className="h-4 w-4" />
            Back to Books
          </Link>
        </Button>

        <Card className="overflow-hidden border-[#E2E8F0]/70 bg-white/90 shadow-sm dark:border-gray-800 dark:bg-gray-900/90">
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] text-3xl font-bold text-white shadow-md">
              {getInitials(author.name)}
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white sm:text-4xl">
                    {author.name}
                  </h1>
                  {author.nameKh && (
                    <p className="mt-1 text-lg text-[#5E5E5E] dark:text-gray-400">
                      {author.nameKh}
                    </p>
                  )}
                </div>
                <Badge className="border-0 bg-[#20659C]/10 px-3 py-1 text-[#20659C] hover:bg-[#20659C]/10 dark:bg-[#55B9EA]/15 dark:text-[#55B9EA]">
                  <BookOpen className="mr-1.5 h-4 w-4" />
                  {author.totalBooks.toLocaleString()} books
                </Badge>
              </div>

              <p className="max-w-3xl leading-7 text-[#5E5E5E] dark:text-gray-300">
                {author.biography || "No biography is available for this author."}
              </p>

              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#20659C] hover:underline dark:text-[#55B9EA]"
                >
                  <Globe className="h-4 w-4" />
                  Visit author website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
            Books by {author.name}
          </h2>
          <p className="mt-1 text-sm text-[#5E5E5E] dark:text-gray-400">
            {author.totalBooks.toLocaleString()} active books in the library
          </p>
        </div>

        {author.books.length === 0 ? (
          <Card className="border-[#E2E8F0]/70 dark:border-gray-800">
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center text-[#5E5E5E] dark:text-gray-400">
              <BookOpen className="mb-3 h-12 w-12 opacity-40" />
              <p className="font-semibold">No active books found</p>
              <p className="text-sm">
                Books linked to this author will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {author.books.map((book) => (
              <Card
                key={book.id}
                className="group overflow-hidden border-[#E2E8F0]/70 bg-white/90 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/90"
              >
                <Link href={`/books/${book.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-gray-800">
                    {book.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/books/${book.id}/cover`}
                        alt={`Cover of ${book.title}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-16 w-16 text-slate-300 dark:text-gray-600" />
                      </div>
                    )}
                    {book.isPrimaryAuthor && (
                      <Badge className="absolute left-3 top-3 border-0 bg-[#DF900A] text-white">
                        Primary author
                      </Badge>
                    )}
                  </div>
                </Link>

                <div className="space-y-3 p-4">
                  <div>
                    <Link href={`/books/${book.id}`}>
                      <h3 className="line-clamp-2 font-bold text-[#1A1A1A] transition-colors group-hover:text-[#20659C] dark:text-white dark:group-hover:text-[#55B9EA]">
                        {book.title}
                      </h3>
                    </Link>
                    {book.titleKh && (
                      <p className="mt-1 line-clamp-1 text-sm text-[#9CA3AF]">
                        {book.titleKh}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#5E5E5E] dark:text-gray-400">
                    {book.publicationYear && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {book.publicationYear}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {book.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" />
                      {book.downloads.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Author books pagination"
            className="flex flex-col items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5 dark:border-gray-800 sm:flex-row"
          >
            <p className="text-sm text-[#5E5E5E] dark:text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link
                    href={`/authors/${author.id}?page=${page - 1}`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
              {getPageNumbers(page, totalPages).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9 text-xs"
                  asChild={page !== pageNumber}
                >
                  {page === pageNumber ? (
                    <span aria-current="page">{pageNumber}</span>
                  ) : (
                    <Link href={`/authors/${author.id}?page=${pageNumber}`}>
                      {pageNumber}
                    </Link>
                  )}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link
                    href={`/authors/${author.id}?page=${page + 1}`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </section>
  );
}
