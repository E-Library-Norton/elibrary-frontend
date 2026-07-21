export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://elibrary.nortonu.app"
).replace(/\/+$/, "");
export const SITE_NAME = "Norton University E-Library";
export const SITE_TITLE = "E-Library Norton — Norton University Digital Library";
export const SITE_DESCRIPTION =
  "Access thousands of academic books, audio lessons, videos, and learning resources from Norton University's digital library.";
export const SITE_IMAGE = `${SITE_URL}/og-social.jpg`;
export const SITE_KEYWORDS = [
  "Norton University",
  "E-Library",
  "digital library",
  "academic books",
  "ebooks",
  "audio books",
  "video lectures",
  "student resources",
  "research materials",
  "online library",
];

export const getPageTitle = (pageTitle: string) => `${pageTitle} | ${SITE_NAME}`;
export const getCanonicalUrl = (pathname: string) =>
  `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
export const getBookUrl = (id: string) => `${SITE_URL}/books/${id}`;
export const getImageUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;
