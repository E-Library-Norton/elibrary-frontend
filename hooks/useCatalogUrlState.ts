"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export interface CatalogSortOption {
  value: string;
  label: string;
  order: string;
}

function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function useCatalogUrlState<T extends CatalogSortOption>(
  sortOptions: readonly T[]
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultSort = sortOptions[0];

  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const page = parsePage(searchParams.get("page"));
  const view = searchParams.get("view") === "list" ? "list" : "grid";
  const sortOption =
    sortOptions.find(
      (option) =>
        option.value === searchParams.get("sortBy") &&
        option.order === searchParams.get("sortOrder")
    ) ?? defaultSort;

  const pushQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });

      const query = next.toString();
      const nextHref = query ? `${pathname}?${query}` : pathname;
      const currentHref = searchParams.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (nextHref !== currentHref) {
        window.history.pushState(null, "", nextHref);
      }
    },
    [pathname, searchParams]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      pushQuery({ page: nextPage > 1 ? String(nextPage) : null });
    },
    [pushQuery]
  );

  const listingHref = searchParams.size
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  return {
    search,
    categoryId,
    page,
    view,
    sortOption,
    defaultSort,
    pushQuery,
    setPage,
    listingHref,
  };
}
