import { getCanonicalUrl, getPageTitle, SITE_DESCRIPTION, SITE_IMAGE } from "@/lib/seo";

const title = getPageTitle("Contact Norton University E-Library");
const description = "Reach Norton University digital library support for membership, resource access, or technical assistance.";
const url = getCanonicalUrl("/contact");

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
