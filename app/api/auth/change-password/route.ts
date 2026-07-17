import { type NextRequest, NextResponse } from "next/server";
import { safeDecrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── PUT /api/auth/change-password ────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const raw = req.cookies.get("access_token")?.value;
    const token = raw ? (safeDecrypt(raw) ?? raw) : null;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: { message: "Current password is required." } },
        { status: 400 }
      );
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: { message: "Password must be at least 8 characters long." } },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: { message: "New passwords do not match." } },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${BACKEND_URL}/auth/change-password`, {
      method: "PUT",
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
