const CATALOG_PATHS = ["/books", "/videos", "/audios"] as const;
type CatalogPath = (typeof CATALOG_PATHS)[number];

export function getCatalogReturnHref(
  value: string | null,
  fallback: CatalogPath = "/books"
) {
  const isCatalogHref = CATALOG_PATHS.some(
    (path) => value === path || value?.startsWith(`${path}?`)
  );

  return isCatalogHref && value ? value : fallback;
}

export function withCatalogReturnHref(path: string, catalogHref: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}from=${encodeURIComponent(catalogHref)}`;
}

export function getCatalogLabel(catalogHref: string) {
  if (catalogHref === "/videos" || catalogHref.startsWith("/videos?")) {
    return "Videos";
  }

  if (catalogHref === "/audios" || catalogHref.startsWith("/audios?")) {
    return "Audios";
  }

  return "Books";
}
