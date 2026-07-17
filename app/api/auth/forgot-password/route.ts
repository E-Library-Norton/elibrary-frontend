import { type NextRequest, NextResponse } from "next/server";

// Render free-tier cold start can take 30-60s.
// Tell Vercel to wait up to 60s instead of the default 10s.
export const maxDuration = 120;

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(115_000), // 115s — under Vercel's 120s limit
    });
    const text = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(text); }
    catch { data = { success: false, message: "Backend is starting up, please try again in a moment." }; }
    return NextResponse.json(data, { status: upstream.status });
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json(
      { success: false, message: isTimeout
          ? "The server is waking up. Please wait a moment and try again."
          : "Could not reach the server. Please try again." },
      { status: 503 }
    );
  }
}
