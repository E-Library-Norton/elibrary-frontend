const BOOKS_PATH = "/books";

export function getBooksReturnHref(value: string | null) {
  return value === BOOKS_PATH || value?.startsWith(`${BOOKS_PATH}?`)
    ? value
    : BOOKS_PATH;
}

export function withBooksReturnHref(path: string, booksHref: string) {
  return `${path}?from=${encodeURIComponent(booksHref)}`;
}
