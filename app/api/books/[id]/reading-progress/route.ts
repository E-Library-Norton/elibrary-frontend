import { type NextRequest } from "next/server";
import { authenticatedBackendProxy } from "@/lib/server/authenticated-backend-proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return authenticatedBackendProxy(request, `/books/${id}/reading-progress`);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return authenticatedBackendProxy(request, `/books/${id}/reading-progress`, {
    method: "PUT",
    forwardBody: true,
  });
}
