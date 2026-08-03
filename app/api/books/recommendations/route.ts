import { type NextRequest } from "next/server";
import { authenticatedBackendProxy } from "@/lib/server/authenticated-backend-proxy";

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams.toString();
  const path = `/books/recommendations${searchParams ? `?${searchParams}` : ""}`;
  return authenticatedBackendProxy(request, path);
}
