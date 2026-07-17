import { getCanonicalUrl, getPageTitle, SITE_IMAGE } from "@/lib/seo";

const title = getPageTitle("Forgot Password — Norton University E-Library");
const description = "Reset your Norton University E-Library account password securely.";
const url = getCanonicalUrl("/auth/forgot-password");

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
