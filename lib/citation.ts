export type CitationStyle = "apa" | "mla" | "chicago" | "ieee";

export const CITATION_STYLES: ReadonlyArray<{
  value: CitationStyle;
  label: string;
  description: string;
}> = [
  {
    value: "apa",
    label: "APA",
    description: "7th Ed. · American Psychological Association",
  },
  {
    value: "mla",
    label: "MLA",
    description: "9th Ed. · Modern Language Association",
  },
  {
    value: "chicago",
    label: "Chicago",
    description: "17th Ed. · Chicago Manual of Style",
  },
  {
    value: "ieee",
    label: "IEEE",
    description: "Institute of Electrical and Electronics Engineers",
  },
];

export interface CitationBook {
  id: number;
  title: string;
  authors: string[];
  publisher?: string | null;
  publicationYear?: number | null;
  isbn?: string | null;
}

function splitAuthorName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (normalized.includes(",")) {
    const [lastName, ...givenParts] = normalized.split(",");
    return {
      givenName: givenParts.join(",").trim(),
      lastName: lastName.trim(),
    };
  }

  const parts = normalized.split(" ");
  if (parts.length === 1) {
    return { givenName: "", lastName: parts[0] };
  }

  return {
    givenName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  };
}

function initials(givenName: string) {
  return givenName
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}.`)
    .join(" ");
}

function formatApaAuthors(authors: string[]) {
  const formatted = authors.map((author) => {
    const { givenName, lastName } = splitAuthorName(author);
    const authorInitials = initials(givenName);
    return authorInitials ? `${lastName}, ${authorInitials}` : lastName;
  });

  if (formatted.length < 2) return formatted[0] ?? "";
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(", ")}, & ${formatted.at(-1)}`;
}

function formatMlaAuthors(authors: string[]) {
  if (authors.length === 0) return "";
  const first = splitAuthorName(authors[0]);
  const firstFormatted = first.givenName
    ? `${first.lastName}, ${first.givenName}`
    : first.lastName;

  if (authors.length === 1) return firstFormatted;
  if (authors.length === 2) return `${firstFormatted}, and ${authors[1]}`;
  return `${firstFormatted}, et al.`;
}

function formatChicagoAuthors(authors: string[]) {
  if (authors.length === 0) return "";
  const first = splitAuthorName(authors[0]);
  const firstFormatted = first.givenName
    ? `${first.lastName}, ${first.givenName}`
    : first.lastName;

  if (authors.length === 1) return firstFormatted;
  if (authors.length === 2) return `${firstFormatted}, and ${authors[1]}`;
  return `${firstFormatted}, ${authors.slice(1, -1).join(", ")}, and ${authors.at(-1)}`;
}

function formatIeeeAuthors(authors: string[]) {
  return authors
    .map((author) => {
      const { givenName, lastName } = splitAuthorName(author);
      const authorInitials = initials(givenName);
      return authorInitials ? `${authorInitials} ${lastName}` : lastName;
    })
    .join(", ");
}

function finish(parts: Array<string | null | undefined>) {
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateCitation(
  book: CitationBook,
  style: CitationStyle
) {
  const year = book.publicationYear ? String(book.publicationYear) : "n.d.";
  const publisher = book.publisher?.trim();

  if (style === "apa") {
    const authors = formatApaAuthors(book.authors);
    return finish([
      authors ? `${authors}` : null,
      `(${year}).`,
      `${book.title}.`,
      publisher ? `${publisher}.` : null,
    ]);
  }

  if (style === "mla") {
    const authors = formatMlaAuthors(book.authors);
    return finish([
      authors ? `${authors}.` : null,
      `${book.title}.`,
      publisher ? `${publisher},` : null,
      `${year}.`,
    ]);
  }

  if (style === "ieee") {
    const authors = formatIeeeAuthors(book.authors);
    return finish([
      authors ? `${authors},` : null,
      `"${book.title},"`,
      `${publisher || "n.p."},`,
      `${year}.`,
      book.isbn ? `ISBN: ${book.isbn}.` : null,
    ]);
  }

  const authors = formatChicagoAuthors(book.authors);
  return finish([
    authors ? `${authors}.` : null,
    `${book.title}.`,
    publisher ? `${publisher},` : null,
    `${year}.`,
  ]);
}
