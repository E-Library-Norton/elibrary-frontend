import { type NextRequest } from "next/server";
import { authenticatedBackendProxy } from "@/lib/server/authenticated-backend-proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return authenticatedBackendProxy(request, `/books/${id}/bookmarks`);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return authenticatedBackendProxy(request, `/books/${id}/bookmarks`, {
    method: "POST",
    forwardBody: true,
  });
}
