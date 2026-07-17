import type { ApiResponse, PaginatedData, Book } from "@/types";

const BACKEND_API =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ||
  "http://localhost:5005/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nortonuniversity.edu";

const STATIC_PAGES = [
  { path: "/", priority: "1.0" },
  { path: "/books", priority: "0.9" },
  { path: "/audios", priority: "0.8" },
  { path: "/videos", priority: "0.8" },
  { path: "/library", priority: "0.7" },
  { path: "/contact", priority: "0.6" },
  { path: "/about", priority: "0.6" },
];

async function fetchBooksForSitemap() {
  try {
    // Fetch first page with max limit to get total count
    const res = await fetch(
      `${BACKEND_API}/books?page=1&limit=50000&isActive=true`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];

    const payload = (await res.json()) as ApiResponse<PaginatedData<Book>>;
    return payload.data?.books || [];
  } catch (error) {
    console.error("Sitemap: Failed to fetch books", error);
    return [];
  }
}

export async function GET() {
  const books = await fetchBooksForSitemap();

  const staticUrls = STATIC_PAGES.map(
    ({ path, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("\n");

  const bookUrls = books
    .map(
      (book) => `  <url>
    <loc>${SITE_URL}/books/${book.id}</loc>
    <lastmod>${book.updatedAt ? new Date(book.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${bookUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
