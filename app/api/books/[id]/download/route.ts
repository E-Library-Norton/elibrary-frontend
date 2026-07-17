import { type NextRequest, NextResponse } from "next/server";
import { safeDecrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── GET /api/books/[id]/download ─────────────────────────────────────────────
// Same-origin proxy: decrypts cookie, adds Bearer, streams PDF as attachment.
// Never exposes the R2 presigned URL to the browser.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw   = req.cookies.get("access_token")?.value;
    const token = raw ? (safeDecrypt(raw) ?? raw) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const upstream = await fetch(`${BACKEND_URL}/books/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      const body = await upstream.json().catch(() => ({}));
      return NextResponse.json(body, { status: upstream.status });
    }

    const headers: Record<string, string> = {
      "Content-Type":        upstream.headers.get("Content-Type")        ?? "application/pdf",
      "Content-Disposition": upstream.headers.get("Content-Disposition") ?? `attachment; filename="book-${id}.pdf"`,
      "Cache-Control":       "private, no-store",
    };
    const len = upstream.headers.get("Content-Length");
    if (len) headers["Content-Length"] = len;

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
