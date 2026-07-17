import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── GET /api/books ───────────────────────────────────────────────────────────
// Public endpoint — optionally attaches Bearer token if user is logged in.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.cookies.get("access_token")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const upstream = await fetch(
      `${BACKEND_URL}/books?${searchParams.toString()}`,
      { headers, cache: "no-store" }
    );

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
