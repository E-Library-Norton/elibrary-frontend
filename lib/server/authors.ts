import "server-only";
import type { AuthorDetails, AuthorList } from "@/types/author";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function getBackendUrl() {
  if (!BACKEND_URL) {
    throw new Error("Backend URL is not configured");
  }
  return BACKEND_URL;
}

export async function getAuthorDetails(
  authorId: string,
  page: number,
  limit = 12
) {
  const response = await fetch(
    `${getBackendUrl()}/authors/${encodeURIComponent(authorId)}?page=${page}&limit=${limit}`,
    { cache: "no-store" }
  );

  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) {
    throw new Error("Unable to load author details");
  }

  const payload = (await response.json()) as ApiResponse<AuthorDetails>;
  return payload.data;
}

export async function getAuthors(
  page: number,
  limit = 12,
  search = ""
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);

  const response = await fetch(
    `${getBackendUrl()}/authors?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Unable to load authors");
  }

  const payload = (await response.json()) as ApiResponse<AuthorList>;
  return payload.data;
}
