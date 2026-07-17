import { type NextRequest, NextResponse } from "next/server";
import { safeDecrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── GET /api/auth/avatar ───────────────────────────────────────────────────
// Authenticated same-origin proxy for current user's avatar.
export async function GET(req: NextRequest) {
  try {
    const raw = req.cookies.get("access_token")?.value;
    const token = raw ? (safeDecrypt(raw) ?? raw) : null;
    if (!token) {
      return new NextResponse(null, { status: 401 });
    }

    const upstream = await fetch(`${BACKEND_URL}/auth/avatar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}

// ─── POST /api/auth/avatar ────────────────────────────────────────────────────
// Receives multipart/form-data from client, forwards to backend with Bearer token.
export async function POST(req: NextRequest) {
  try {
    const raw = req.cookies.get("access_token")?.value;
    const token = raw ? (safeDecrypt(raw) ?? raw) : null;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse incoming FormData and pass it straight through
    const formData = await req.formData();

    const upstream = await fetch(`${BACKEND_URL}/auth/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type — browser/fetch will set multipart + boundary
      },
      body: formData,
      cache: "no-store",
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
