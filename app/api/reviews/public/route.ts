import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── GET /api/reviews/public ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const upstream = await fetch(
      `${BACKEND_URL}/reviews/public?${searchParams.toString()}`,
      {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("[GET /api/reviews/public]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch public reviews" },
      { status: 500 }
    );
  }
}
