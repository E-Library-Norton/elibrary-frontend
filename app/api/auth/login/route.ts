// src/app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Cookie config shared across auth routes
export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
// ─── Proxy helper 
export async function proxyPost(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
export async function proxyGet(path: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${BACKEND_URL}${path}`, { headers });
}
// ─── POST /api/auth/login 
// Calls backend, gets tokens, sets them as HTTP-only cookies.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await proxyPost("/auth/login", body);
    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const { accessToken, refreshToken, user } = data.data;

    const response = NextResponse.json(
      { success: true, data: user, message: "Login successful" },
      { status: 200 }
    );

    // HTTP-only cookies — encrypted with AES-256-GCM, never accessible from client JS
    response.cookies.set("access_token", encrypt(accessToken), {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    response.cookies.set("refresh_token", encrypt(refreshToken), {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 60, // 60 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
