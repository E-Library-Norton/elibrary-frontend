import { type NextRequest } from "next/server";
import { authenticatedBackendProxy } from "@/lib/server/authenticated-backend-proxy";

export async function GET(request: NextRequest) {
  return authenticatedBackendProxy(request, "/user/preferences");
}

export async function POST(request: NextRequest) {
  return authenticatedBackendProxy(request, "/user/preferences", {
    method: "POST",
    forwardBody: true,
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedBackendProxy(request, "/user/preferences", {
    method: "PATCH",
    forwardBody: true,
  });
}
