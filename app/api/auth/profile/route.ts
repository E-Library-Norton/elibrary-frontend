import { type NextRequest, NextResponse } from "next/server";
import { safeDecrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── PATCH /api/auth/profile ──────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const raw = req.cookies.get("access_token")?.value;
    const token = raw ? (safeDecrypt(raw) ?? raw) : null;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const upstream = await fetch(`${BACKEND_URL}/auth/profile`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
