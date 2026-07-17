import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api\/?$/, "") ?? "http://localhost:5005";

export async function GET() {
  return NextResponse.redirect(`${BACKEND_URL}/api/auth/google`);
}
