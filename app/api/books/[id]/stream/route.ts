import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── GET /api/books/[id]/stream ───────────────────────────────────────────────
// Same-origin proxy: Next.js server fetches the PDF from the backend (which
// fetches from R2 with a presigned URL server-side). The browser never sees
// the R2 URL, so no CORS issue on the R2 bucket.
// The backend /stream endpoint is public — no auth header needed here.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const upstream = await fetch(`${BACKEND_URL}/books/${id}/stream`, {
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { success: false, message: "PDF not available" },
        { status: upstream.status }
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type":        upstream.headers.get("Content-Type")        ?? "application/pdf",
        "Content-Disposition": upstream.headers.get("Content-Disposition") ?? "inline",
        "Cache-Control":       "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
