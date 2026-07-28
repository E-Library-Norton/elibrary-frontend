import { type NextRequest, NextResponse } from "next/server";
import { safeDecrypt } from "@/lib/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type ProxyOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  forwardBody?: boolean;
};

function errorResponse(message: string, status: number, code: string) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

export async function authenticatedBackendProxy(
  request: NextRequest,
  path: string,
  options: ProxyOptions = {}
) {
  if (!BACKEND_URL) {
    return errorResponse(
      "Backend URL is not configured",
      500,
      "CONFIGURATION_ERROR"
    );
  }

  const encryptedToken = request.cookies.get("access_token")?.value;
  const token = encryptedToken
    ? safeDecrypt(encryptedToken) ?? encryptedToken
    : null;

  if (!token) {
    return errorResponse("Authentication required", 401, "UNAUTHORIZED");
  }

  try {
    const method = options.method ?? request.method;
    const body =
      options.forwardBody && method !== "GET" && method !== "DELETE"
        ? await request.text()
        : undefined;
    const upstream = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body || undefined,
      cache: "no-store",
    });

    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseBody = await upstream.text();
    return new NextResponse(responseBody || null, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return errorResponse(
      "Unable to reach the library service",
      502,
      "UPSTREAM_ERROR"
    );
  }
}
