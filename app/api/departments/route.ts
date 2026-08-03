import { NextResponse, type NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "CONFIGURATION_ERROR", message: "Backend URL is not configured" },
      },
      { status: 500 },
    );
  }

  try {
    const searchParams = new URL(request.url).searchParams.toString();
    const upstream = await fetch(
      `${BACKEND_URL}/departments${searchParams ? `?${searchParams}` : ""}`,
      { cache: "no-store" },
    );
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UPSTREAM_ERROR", message: "Unable to reach the library service" },
      },
      { status: 502 },
    );
  }
}
