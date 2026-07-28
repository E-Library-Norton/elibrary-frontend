import { type NextRequest } from "next/server";
import { authenticatedBackendProxy } from "@/lib/server/authenticated-backend-proxy";

export async function GET(request: NextRequest) {
  return authenticatedBackendProxy(request, "/library/reading-progress");
}
