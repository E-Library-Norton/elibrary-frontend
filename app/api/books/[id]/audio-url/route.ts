import { type NextRequest, NextResponse } from "next/server";
import { safeDecrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const CORS = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ─── GET /api/books/[id]/audio-url ───────────────────────────────────────────
// Returns a short-lived presigned R2 URL for the book's audio.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = req.cookies.get("access_token")?.value;
    const token = raw ? (safeDecrypt(raw) ?? raw) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401, headers: CORS }
      );
    }

    const upstream = await fetch(`${BACKEND_URL}/books/${id}/audio-url`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const body = await upstream.json();
    return NextResponse.json(body, { status: upstream.status, headers: CORS });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch audio URL" },
      { status: 500, headers: CORS }
    );
  }
}
