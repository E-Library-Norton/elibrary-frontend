import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Search, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthors } from "@/lib/server/authors";

export const metadata: Metadata = {
  title: "Authors",
  description: "Browse authors and their books in Norton University E-Library.",
};

const PAGE_SIZE = 12;

interface AuthorsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
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

function getAuthorsHref(page: number, search: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("search", search);
  const query = params.toString();
  return `/authors${query ? `?${query}` : ""}`;
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const query = await searchParams;
  const requestedPage = Number(query.page ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const search = String(query.search ?? "").trim();
  const data = await getAuthors(page, PAGE_SIZE, search);
  const totalPages = Math.max(data.totalPages, 1);

  return (
    <section className="min-h-screen bg-[#F8FAFC] py-10 dark:bg-gray-950 sm:py-14">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white sm:text-4xl">
            Authors
          </h1>
          <p className="mt-2 text-[#5E5E5E] dark:text-gray-400">
            Discover authors and explore all books connected to their profiles.
          </p>
        </div>

        <form action="/authors" method="get" className="flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search author name…"
              className="h-11 bg-white pl-9 dark:bg-gray-900"
            />
          </div>
          <Button type="submit" className="h-11">
            Search
          </Button>
        </form>

        <div className="flex items-center justify-between">
          <p className="text-sm text-[#5E5E5E] dark:text-gray-400">
            {data.total.toLocaleString()} authors found
          </p>
          {search && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/authors">Clear search</Link>
            </Button>
          )}
        </div>

        {data.authors.length === 0 ? (
          <Card className="border-[#E2E8F0]/70 dark:border-gray-800">
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center text-[#5E5E5E] dark:text-gray-400">
              <UserRound className="mb-3 h-12 w-12 opacity-40" />
              <p className="font-semibold">No authors found</p>
              <p className="text-sm">Try another author name.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.authors.map((author) => (
              <Card
                key={author.id}
                className="group border-[#E2E8F0]/70 bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/90"
              >
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] font-bold text-white shadow-sm">
                      {getInitials(author.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/authors/${author.id}`}>
                        <h2 className="line-clamp-1 text-lg font-bold text-[#1A1A1A] transition-colors group-hover:text-[#20659C] dark:text-white dark:group-hover:text-[#55B9EA]">
                          {author.name}
                        </h2>
                      </Link>
                      {author.nameKh && (
                        <p className="line-clamp-1 text-sm text-[#9CA3AF]">
                          {author.nameKh}
                        </p>
                      )}
                    </div>
                    <Badge className="shrink-0 border-0 bg-[#20659C]/10 text-[#20659C] hover:bg-[#20659C]/10 dark:bg-[#55B9EA]/15 dark:text-[#55B9EA]">
                      <BookOpen className="mr-1 h-3.5 w-3.5" />
                      {author.totalBooks}
                    </Badge>
                  </div>

                  <p className="line-clamp-3 flex-1 text-sm leading-6 text-[#5E5E5E] dark:text-gray-400">
                    {author.biography || "No biography is available."}
                  </p>

                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/authors/${author.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Authors pagination"
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
                    href={getAuthorsHref(page - 1, search)}
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
                    <Link href={getAuthorsHref(pageNumber, search)}>
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
                    href={getAuthorsHref(page + 1, search)}
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
