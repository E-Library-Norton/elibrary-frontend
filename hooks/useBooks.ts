"use client";

import { useGetBooksQuery, useGetBookByIdQuery } from "@/store/api/booksApi";
import type { BooksQuery } from "@/types";

// ── Get paginated book list ────────────────────────────────────────────────────
export function useBooks(query: BooksQuery = {}) {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetBooksQuery(query, {
      refetchOnMountOrArgChange: false,
    });

  return {
    books: data?.data?.books ?? [],
    total: data?.data?.total ?? 0,
    page: data?.data?.page ?? 1,
    limit: data?.data?.limit ?? 12,
    totalPages: data?.data?.totalPages ?? 1,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

// ── Get a single book ─────────────────────────────────────────────────────────
export function useBook(id: string | number | undefined) {
  const { data, isLoading, isError, error } = useGetBookByIdQuery(
    String(id ?? ""),
    { skip: !id }
  );

  return {
    book: data?.data ?? null,
    isLoading,
    isError,
    error,
  };
}
