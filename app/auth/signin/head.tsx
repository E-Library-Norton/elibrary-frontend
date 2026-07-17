import { getCanonicalUrl, getPageTitle, SITE_IMAGE } from "@/lib/seo";

const title = getPageTitle("Sign In — Norton University E-Library");
const description = "Log in to your Norton University digital library account to access your books, reading progress, and saved resources.";
const url = getCanonicalUrl("/auth/signin");

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
      <meta name="robots" content="noindex, follow" />
    </>
  );
}
