import { getCanonicalUrl, getPageTitle, SITE_IMAGE } from "@/lib/seo";

const title = getPageTitle("Create Account — Norton University E-Library");
const description = "Register for Norton University's digital library to access thousands of books, audio, and video resources.";
const url = getCanonicalUrl("/auth/signup");

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
