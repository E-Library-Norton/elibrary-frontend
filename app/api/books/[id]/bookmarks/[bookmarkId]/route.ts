import { type NextRequest } from "next/server";
import { authenticatedBackendProxy } from "@/lib/server/authenticated-backend-proxy";

type RouteContext = {
  params: Promise<{ id: string; bookmarkId: string }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id, bookmarkId } = await params;
  return authenticatedBackendProxy(
    request,
    `/books/${id}/bookmarks/${bookmarkId}`,
    { method: "DELETE" }
  );
}
