import { type NextRequest, NextResponse } from "next/server";
import { safeDecrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Reads access_token from HTTP-only cookie, decrypts it, forwards as Bearer.
export async function GET(req: NextRequest) {
  try {
    const raw = req.cookies.get("access_token")?.value;
    const token = raw ? (safeDecrypt(raw) ?? raw) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const upstream = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Prevent caching of auth responses
      cache: "no-store",
    });

    const data = await upstream.json();

    // Normalize — backend returns { data: { id, username, ... } }
    return NextResponse.json(
      { success: data.success, data: data.data, message: data.message },
      { status: upstream.status }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
