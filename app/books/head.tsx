import { getCanonicalUrl, getPageTitle, SITE_DESCRIPTION, SITE_IMAGE } from "@/lib/seo";

const title = getPageTitle("Books Library — Norton University E-Library");
const description = "Browse Norton University's curated collection of books, study materials, and research resources available in the digital library.";
const url = getCanonicalUrl("/books");

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={SITE_IMAGE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={SITE_IMAGE} />
    </>
  );
}
