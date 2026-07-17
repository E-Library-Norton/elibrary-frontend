import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── GET /api/users/[id]/avatar ───────────────────────────────────────────────
// Public proxy — fetches any user's avatar from the backend (no auth needed).
// The backend returns a 302 redirect to a signed R2 URL; we stream the image
// back so the browser never sees the R2 domain.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const upstream = await fetch(`${BACKEND_URL}/users/${id}/avatar`, {
      redirect: "follow", // follow the 302 to the signed R2 URL
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get("Content-Type") ?? "image/jpeg";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
