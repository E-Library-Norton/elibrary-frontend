import { type NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto";
import { COOKIE_OPTS } from "@/app/api/auth/login/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * POST /api/auth/oauth-callback
 * Body: { accessToken, refreshToken }
 * Sets the encrypted HTTP-only cookies and fetches the user profile.
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken, refreshToken } = await req.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ success: false, message: "Missing tokens" }, { status: 400 });
    }

    // Fetch user profile from backend to return to the client store
    const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json();

    const response = NextResponse.json(
      { success: true, data: meData?.data ?? null },
      { status: 200 }
    );

    response.cookies.set("access_token", encrypt(accessToken), {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("refresh_token", encrypt(refreshToken), {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
