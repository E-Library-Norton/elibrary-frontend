import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import type { ApiResponse, Book, PaginatedData } from "@/types";

const BACKEND_API =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ||
  "http://localhost:5005/api";
const PAGE_SIZE = 100;
const FETCH_CONCURRENCY = 5;

export const revalidate = 3600;

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: "weekly";
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/books", changeFrequency: "weekly", priority: 0.9 },
  { path: "/audios", changeFrequency: "weekly", priority: 0.8 },
  { path: "/videos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "weekly", priority: 0.6 },
];

async function fetchBookPage(page: number) {
  const response = await fetch(
    `${BACKEND_API}/books?page=${page}&limit=${PAGE_SIZE}&isActive=true`,
    { next: { revalidate } }
  );

  if (!response.ok) return null;
  return (await response.json()) as ApiResponse<PaginatedData<Book>>;
}

async function getBooks() {
  try {
    const firstPage = await fetchBookPage(1);
    if (!firstPage?.data) return [];

    const books = [...(firstPage.data.books ?? [])];
    const totalPages = firstPage.data.totalPages ?? 1;

    for (let start = 2; start <= totalPages; start += FETCH_CONCURRENCY) {
      const pageNumbers = Array.from(
        { length: Math.min(FETCH_CONCURRENCY, totalPages - start + 1) },
        (_, index) => start + index
      );
      const pages = await Promise.all(pageNumbers.map(fetchBookPage));
      pages.forEach((page) => books.push(...(page?.data?.books ?? [])));
    }

    return books;
  } catch (error) {
    console.error("Sitemap: Failed to fetch books", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getBooks();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const bookEntries: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${SITE_URL}/books/${book.id}`,
    lastModified: book.updatedAt ? new Date(book.updatedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...bookEntries];
}
