import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── GET /api/books/[id]/cover ────────────────────────────────────────────────
// Public proxy: backend generates a presigned R2 URL and redirects.
// fetch() follows the 302 automatically, so we get the image bytes
// and stream them back to the browser same-origin (no CORS issues).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const upstream = await fetch(`${BACKEND_URL}/books/${id}/cover`, {
      // follow redirects (default) → fetches actual image bytes from R2
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get("Content-Type") ?? "image/jpeg";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type":  contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
