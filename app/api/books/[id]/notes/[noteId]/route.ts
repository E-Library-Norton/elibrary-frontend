import { type NextRequest } from "next/server";
import { authenticatedBackendProxy } from "@/lib/server/authenticated-backend-proxy";

type RouteContext = {
  params: Promise<{ id: string; noteId: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id, noteId } = await params;
  return authenticatedBackendProxy(
    request,
    `/books/${id}/notes/${noteId}`,
    { method: "PATCH", forwardBody: true }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id, noteId } = await params;
  return authenticatedBackendProxy(
    request,
    `/books/${id}/notes/${noteId}`,
    { method: "DELETE" }
  );
}
