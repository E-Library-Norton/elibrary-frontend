import { type NextRequest, NextResponse } from "next/server";
import { encrypt, safeDecrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
// Reads refresh_token cookie, exchanges for a new access_token, updates cookie.
export async function POST(req: NextRequest) {
  try {
    const raw = req.cookies.get("refresh_token")?.value;
    const refreshToken = raw ? (safeDecrypt(raw) ?? raw) : undefined;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 401 }
      );
    }

    const upstream = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const response = NextResponse.json(data, { status: upstream.status });
      // Only wipe cookies on explicit auth rejection (401/403).
      // A 500 / 502 / 503 means the backend is temporarily down — the tokens
      // may still be perfectly valid, so don't log the user out.
      if (upstream.status === 401 || upstream.status === 403) {
        response.cookies.set("access_token", "", { ...COOKIE_OPTS, maxAge: 0 });
        response.cookies.set("refresh_token", "", { ...COOKIE_OPTS, maxAge: 0 });
      }
      return response;
    }

    const { accessToken } = data.data;
    const response = NextResponse.json(
      { success: true, message: "Token refreshed" },
      { status: 200 }
    );
    response.cookies.set("access_token", encrypt(accessToken), {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
